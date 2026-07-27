from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.ocr_provider import MockMultimodalOCRProvider, BaseOCRProvider
from app.models.multimodal import (
    UploadedDocument,
    DocumentPage,
    OCRResult,
    RecognizedRegion,
    DiagramComponent,
    MathematicalExpression,
    NormalizedRepresentation
)

class LayoutAnalysisEngine:
    def segment_layout(self, raw_ocr_output: Dict[str, Any]) -> List[Dict[str, Any]]:
        return raw_ocr_output.get("regions", [])


class MathFormulaExtractor:
    def extract_and_normalize(self, region_data: Dict[str, Any]) -> Dict[str, Any]:
        raw_text = region_data.get("raw_text", "")
        latex = region_data.get("latex", raw_text)
        return {
            "latex_expression": latex,
            "normalized_ascii": raw_text,
            "is_valid_latex": True
        }


class DiagramParser:
    def parse_diagram(self, region_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "diagram_type": region_data.get("diagram_type", "SCHEMATIC"),
            "detected_labels": region_data.get("detected_labels", []),
            "components_json": {"elements_count": len(region_data.get("detected_labels", []))}
        }


class MultimodalNormalizationEngine:
    def __init__(self, db: Session, ocr_provider: BaseOCRProvider = None):
        self.db = db
        self.ocr_provider = ocr_provider or MockMultimodalOCRProvider()
        self.layout_engine = LayoutAnalysisEngine()
        self.math_extractor = MathFormulaExtractor()
        self.diagram_parser = DiagramParser()

    def process_document(self, document_id: str, question_id: str = None) -> NormalizedRepresentation:
        doc = self.db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
        if not doc:
            raise ValueError(f"Uploaded document {document_id} not found.")

        pages = self.db.query(DocumentPage).filter(DocumentPage.document_id == document_id).order_by(DocumentPage.page_number.asc()).all()
        
        all_text_parts = []
        all_latex_formulas = []
        all_diagrams = []
        all_tables = []
        total_confidence = 0.0
        region_count = 0

        for page in pages:
            ocr_output = self.ocr_provider.process_image(page.image_path)
            
            ocr_record = OCRResult(
                page_id=page.id,
                ocr_provider=ocr_output.get("provider_name", "MockOCR"),
                language_detected=ocr_output.get("language_detected", "en+hi"),
                overall_confidence=ocr_output.get("overall_confidence", 0.90),
                processed_at=datetime.now(timezone.utc)
            )
            self.db.add(ocr_record)
            self.db.commit()
            self.db.refresh(ocr_record)

            regions = self.layout_engine.segment_layout(ocr_output)
            for reg in regions:
                r_type = reg.get("region_type", "PARAGRAPH")
                raw_text = reg.get("raw_text", "")
                conf = reg.get("confidence_score", 0.90)

                total_confidence += conf
                region_count += 1

                reg_record = RecognizedRegion(
                    ocr_result_id=ocr_record.id,
                    region_type=r_type,
                    bounding_box=reg.get("bounding_box", {}),
                    raw_text=raw_text,
                    confidence_score=conf
                )
                self.db.add(reg_record)
                self.db.commit()
                self.db.refresh(reg_record)

                if r_type in ["PARAGRAPH", "HANDWRITING"]:
                    all_text_parts.append(raw_text)

                elif r_type == "MATH_FORMULA":
                    math_data = self.math_extractor.extract_and_normalize(reg)
                    math_rec = MathematicalExpression(
                        region_id=reg_record.id,
                        latex_expression=math_data["latex_expression"],
                        normalized_ascii=math_data["normalized_ascii"],
                        is_valid_latex=math_data["is_valid_latex"]
                    )
                    self.db.add(math_rec)
                    all_latex_formulas.append(math_data["latex_expression"])
                    all_text_parts.append(math_data["normalized_ascii"])

                elif r_type == "DIAGRAM":
                    diag_data = self.diagram_parser.parse_diagram(reg)
                    diag_rec = DiagramComponent(
                        region_id=reg_record.id,
                        diagram_type=diag_data["diagram_type"],
                        detected_labels=diag_data["detected_labels"],
                        components_json=diag_data["components_json"]
                    )
                    self.db.add(diag_rec)
                    all_diagrams.append(diag_data)
                    all_text_parts.append(f"[Diagram: {diag_data['diagram_type']} with labels {diag_data['detected_labels']}]")

        self.db.commit()

        avg_confidence = (total_confidence / max(region_count, 1)) if region_count > 0 else 0.90

        unified_payload = {
            "cleaned_text": "\n".join(all_text_parts),
            "latex_formulas": all_latex_formulas,
            "tables": all_tables,
            "diagrams": all_diagrams,
            "confidence_summary": round(avg_confidence, 2),
            "page_count": len(pages)
        }

        norm_rec = NormalizedRepresentation(
            document_id=doc.id,
            submission_id=doc.submission_id,
            question_id=question_id,
            unified_payload=unified_payload,
            is_teacher_corrected=False,
            normalized_at=datetime.now(timezone.utc)
        )
        self.db.add(norm_rec)
        self.db.commit()
        self.db.refresh(norm_rec)

        return norm_rec
