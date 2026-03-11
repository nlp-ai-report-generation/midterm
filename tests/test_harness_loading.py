"""하네스 로딩 테스트."""

from pathlib import Path

from src.harnesses.loader import (
    HARNESSES_DIR,
    load_all_category_harnesses,
    load_calibration_harness,
    load_harness,
    load_report_harness,
)


class TestLoadHarness:
    def test_load_category_1(self):
        harness = load_harness(HARNESSES_DIR / "category_1_language.md")
        assert harness.harness_id == "category_1_language"
        assert harness.category == "1. 언어 표현 품질"
        assert len(harness.items) == 3
        assert harness.items[0].item_id == "1.1"
        assert harness.items[0].weight == "HIGH"
        assert harness.items[0].chunk_focus == "all"
        assert harness.system_prompt  # 프롬프트가 비어있지 않음

    def test_load_category_2(self):
        harness = load_harness(HARNESSES_DIR / "category_2_structure.md")
        assert len(harness.items) == 5
        assert harness.items[0].chunk_focus == "first"  # 학습 목표 안내
        assert harness.items[4].chunk_focus == "last"   # 마무리 요약
        assert harness.items[4].weight == "LOW"

    def test_load_category_5(self):
        harness = load_harness(HARNESSES_DIR / "category_5_interaction.md")
        assert len(harness.items) == 4
        high_items = [i for i in harness.items if i.weight == "HIGH"]
        assert len(high_items) == 3

    def test_load_all_categories(self):
        harnesses = load_all_category_harnesses()
        assert len(harnesses) == 5

        total_items = sum(len(h.items) for h in harnesses)
        assert total_items == 18  # 전체 18개 항목

    def test_load_calibration(self):
        harness = load_calibration_harness()
        assert harness.harness_id == "calibration"
        assert "보정" in harness.system_prompt

    def test_load_report(self):
        harness = load_report_harness()
        assert harness.harness_id == "report_synthesis"
        assert "리포트" in harness.system_prompt

    def test_all_harnesses_have_prompts(self):
        harnesses = load_all_category_harnesses()
        for h in harnesses:
            assert len(h.system_prompt) > 100, f"{h.harness_id} has too short prompt"
            assert "STT" in h.system_prompt, f"{h.harness_id} missing STT caveat"
            assert "주의사항" in h.system_prompt, f"{h.harness_id} missing guardrails"

    def test_item_ids_unique(self):
        harnesses = load_all_category_harnesses()
        all_ids = [item.item_id for h in harnesses for item in h.items]
        assert len(all_ids) == len(set(all_ids)), "Duplicate item IDs found"
