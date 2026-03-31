"""Manim 애니메이션 — 우리 디자인 토큰 사용"""
from manim import *

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30
config.background_color = WHITE

# 디자인 토큰 (프론트와 동일)
ACCENT = "#FF6B00"
BLACK = "#0F172A"
SUB = "#475569"
MUTED = "#94A3B8"
LINE = "#E2E8F0"
SURFACE = "#F8FAFC"
ACCENT_LIGHT = "#FFF4EB"


class ArchitectureDiagram(Scene):
    def construct(self):
        title = Text("시스템 구조", font="Pretendard Variable", font_size=36, color=ManimColor(BLACK), weight=BOLD).shift(UP * 3.2)
        self.play(Write(title), run_time=0.4)

        # 입력
        inp = RoundedRectangle(width=2.5, height=1, corner_radius=0.12, fill_color=ManimColor(SURFACE), fill_opacity=1, stroke_color=ManimColor(LINE), stroke_width=1.5).shift(LEFT * 5 + UP * 0.5)
        inp_t = Text("STT 스크립트\n15개 강의", font="Pretendard Variable", font_size=14, color=ManimColor(BLACK)).move_to(inp)
        self.play(FadeIn(inp, shift=RIGHT * 0.3), FadeIn(inp_t), run_time=0.4)

        # 파이프라인
        pipe = RoundedRectangle(width=3.2, height=1.6, corner_radius=0.12, fill_color=ManimColor(ACCENT), fill_opacity=1, stroke_width=0).shift(LEFT * 0.8 + UP * 0.5)
        pipe_t = Text("LangGraph\n파이프라인", font="Pretendard Variable", font_size=16, color=WHITE, weight=BOLD).move_to(pipe)
        pipe_sub = Text("청킹 → 병렬 평가 → 집계 → 리포트", font="Pretendard Variable", font_size=10, color=ManimColor("#FFD6B3")).next_to(pipe, DOWN, buff=0.1)

        a1 = Arrow(inp.get_right(), pipe.get_left(), buff=0.12, color=ManimColor(ACCENT), stroke_width=2.5, max_tip_length_to_length_ratio=0.15)
        self.play(GrowArrow(a1), run_time=0.3)
        self.play(FadeIn(pipe, shift=RIGHT * 0.2), FadeIn(pipe_t), FadeIn(pipe_sub), run_time=0.4)

        # 두 갈래
        op = RoundedRectangle(width=2.8, height=1, corner_radius=0.12, fill_color=ManimColor(ACCENT_LIGHT), fill_opacity=1, stroke_color=ManimColor(ACCENT), stroke_width=1.5).shift(RIGHT * 3.5 + UP * 1.8)
        op_t = Text("운영자 뷰\n대시보드 · 분석 · 검증", font="Pretendard Variable", font_size=12, color=ManimColor(BLACK)).move_to(op)

        inst = RoundedRectangle(width=2.8, height=1, corner_radius=0.12, fill_color=ManimColor(ACCENT_LIGHT), fill_opacity=1, stroke_color=ManimColor(ACCENT), stroke_width=1.5).shift(RIGHT * 3.5 + DOWN * 0.8)
        inst_t = Text("강사 뷰\n내 강의 · 추이 · 캘린더", font="Pretendard Variable", font_size=12, color=ManimColor(BLACK)).move_to(inst)

        a2 = Arrow(pipe.get_right(), op.get_left(), buff=0.12, color=ManimColor(ACCENT), stroke_width=2, max_tip_length_to_length_ratio=0.12)
        a3 = Arrow(pipe.get_right(), inst.get_left(), buff=0.12, color=ManimColor(ACCENT), stroke_width=2, max_tip_length_to_length_ratio=0.12)
        self.play(GrowArrow(a2), GrowArrow(a3), run_time=0.35)
        self.play(FadeIn(op, shift=RIGHT * 0.2), FadeIn(op_t), FadeIn(inst, shift=RIGHT * 0.2), FadeIn(inst_t), run_time=0.4)

        # 기술 스택
        techs = ["React 19", "LangGraph", "FastAPI", "Supabase", "GitHub Actions"]
        stack = VGroup(*[Text(t, font="Pretendard Variable", font_size=12, color=ManimColor(MUTED)) for t in techs]).arrange(RIGHT, buff=0.6).shift(DOWN * 2.8)
        self.play(FadeIn(stack, shift=UP * 0.15), run_time=0.3)
        self.wait(1.5)


class PipelineFlow(Scene):
    def construct(self):
        # 1. 텍스트 입력
        raw = Text(
            '"안녕하세요, 오늘은 Java I/O\n패키지에 대해 설명드리겠습니다.\n먼저 입출력 스트림의 기본 개념부터..."',
            font="Pretendard Variable", font_size=22, color=ManimColor(SUB), line_spacing=1.5,
        ).shift(UP * 2)
        label = Text("STT 스크립트 (22,756줄)", font="Pretendard Variable", font_size=16, color=ManimColor(MUTED)).next_to(raw, UP, buff=0.25)
        self.play(FadeIn(label, shift=DOWN * 0.2), run_time=0.3)
        self.play(Write(raw), run_time=1.2)
        self.wait(0.3)

        # 2. 청킹
        self.play(FadeOut(raw), FadeOut(label), run_time=0.3)
        chunk_label = Text("30분 윈도우 · 5분 오버랩", font="Pretendard Variable", font_size=18, color=ManimColor(ACCENT), weight=BOLD).shift(UP * 2.8)
        self.play(FadeIn(chunk_label, shift=DOWN * 0.2), run_time=0.3)

        chunks = VGroup()
        names = ["청크 1\n00:00~00:30", "청크 2\n00:25~00:55", "청크 3\n00:50~01:20", "···", "청크 N"]
        for i, n in enumerate(names):
            r = RoundedRectangle(width=2, height=1, corner_radius=0.1, fill_color=ManimColor(SURFACE), fill_opacity=1, stroke_color=ManimColor(ACCENT if i < 3 else LINE), stroke_width=1.5)
            t = Text(n, font="Pretendard Variable", font_size=13, color=ManimColor(BLACK)).move_to(r)
            chunks.add(VGroup(r, t))
        chunks.arrange(RIGHT, buff=0.25).move_to(UP * 0.8)

        for c in chunks:
            self.play(FadeIn(c, shift=UP * 0.2), run_time=0.2)
        self.wait(0.3)

        # 3. Fan-out
        self.play(FadeOut(chunks), FadeOut(chunk_label), run_time=0.3)

        cats = ["언어 표현\n품질", "강의 도입\n및 구조", "개념 설명\n명확성", "예시 및\n실습 연계", "수강생\n상호작용"]
        nodes = VGroup()
        for i, cat in enumerate(cats):
            c = Circle(radius=0.55, fill_color=ManimColor(ACCENT_LIGHT), fill_opacity=1, stroke_color=ManimColor(ACCENT), stroke_width=1.5)
            t = Text(cat, font="Pretendard Variable", font_size=11, color=ManimColor(BLACK)).move_to(c)
            nodes.add(VGroup(c, t))
        nodes.arrange(RIGHT, buff=0.6).shift(DOWN * 0.3)

        center = Circle(radius=0.4, fill_color=ManimColor(ACCENT), fill_opacity=1, stroke_width=0).shift(UP * 2)
        center_t = Text("청크", font="Pretendard Variable", font_size=14, color=WHITE).move_to(center)
        self.play(FadeIn(center), FadeIn(center_t), run_time=0.3)

        arrows = VGroup(*[Arrow(center.get_bottom(), n.get_top(), buff=0.1, color=ManimColor(ACCENT), stroke_width=1.5, max_tip_length_to_length_ratio=0.1) for n in nodes])
        self.play(*[GrowArrow(a) for a in arrows], run_time=0.5)
        self.play(*[FadeIn(n, shift=DOWN * 0.15) for n in nodes], run_time=0.4)
        self.wait(0.3)

        # 4. 집계
        agg = RoundedRectangle(width=3.5, height=0.7, corner_radius=0.1, fill_color=ManimColor(ACCENT), fill_opacity=1, stroke_width=0).shift(DOWN * 2.3)
        agg_t = Text("가중 평균 집계 (H=3 · M=2 · L=1)", font="Pretendard Variable", font_size=13, color=WHITE).move_to(agg)
        arrows2 = VGroup(*[Arrow(n.get_bottom(), agg.get_top(), buff=0.1, color=ManimColor(LINE), stroke_width=1, max_tip_length_to_length_ratio=0.08) for n in nodes])
        self.play(*[GrowArrow(a) for a in arrows2], run_time=0.4)
        self.play(FadeIn(agg), FadeIn(agg_t), run_time=0.3)

        score = Text("3.24 / 5.0", font="Pretendard Variable", font_size=32, color=ManimColor(ACCENT), weight=BOLD).shift(DOWN * 3.3)
        self.play(Write(score), run_time=0.4)
        self.wait(0.8)


class ICCPrinciple(Scene):
    def construct(self):
        title = Text("ICC: 반복 평가 일관성", font="Pretendard Variable", font_size=30, color=ManimColor(BLACK), weight=BOLD).shift(UP * 3.2)
        self.play(Write(title), run_time=0.4)

        sub = Text("같은 강의를 세 번 채점했을 때,\n점수 차이가 얼마나 적은지 측정합니다", font="Pretendard Variable", font_size=16, color=ManimColor(SUB), line_spacing=1.5).shift(UP * 2.2)
        self.play(FadeIn(sub, shift=UP * 0.15), run_time=0.3)

        # 3번 채점 시각화
        import random
        random.seed(42)
        base = [3, 4, 3, 2, 4, 3, 3, 5, 4, 3, 4, 3, 2, 3, 4, 3, 4, 3]
        colors = [ACCENT, "#FFB380", "#FFD6B3"]
        labels_text = ["1회차", "2회차", "3회차"]

        # 심플한 바 그룹
        bars_group = VGroup()
        for trial in range(3):
            scores = [min(5, max(1, s + random.choice([-1, 0, 0, 0, 0, 1]))) for s in base]
            bars = VGroup()
            for i, s in enumerate(scores):
                bar = Rectangle(
                    width=0.35, height=s * 0.3,
                    fill_color=ManimColor(colors[trial]), fill_opacity=0.7,
                    stroke_width=0,
                ).shift(RIGHT * (i * 0.5 - 4.25) + DOWN * (1.5 - s * 0.15) + LEFT * trial * 0.12)
                bars.add(bar)
            bars_group.add(bars)

            label = Text(labels_text[trial], font="Pretendard Variable", font_size=13, color=ManimColor(colors[trial])).shift(RIGHT * 6 + DOWN * (0.5 + trial * 0.4))
            self.play(FadeIn(bars, shift=UP * 0.1), FadeIn(label), run_time=0.4)

        self.wait(0.3)

        # 결과
        result = Text("ICC = 0.877", font="Pretendard Variable", font_size=40, color=ManimColor(ACCENT), weight=BOLD).shift(DOWN * 3)
        badge = Text("Good — 15개 중 13개가 이 수준 이상", font="Pretendard Variable", font_size=15, color=ManimColor(SUB)).next_to(result, DOWN, buff=0.15)
        self.play(Write(result), run_time=0.4)
        self.play(FadeIn(badge, shift=UP * 0.1), run_time=0.3)
        self.wait(1)


class HarnessDetail(Scene):
    """하네스 마크다운 내용 확대 + 색상 하이라이트"""
    def construct(self):
        title = Text("하네스: 채점 기준 문서", font="Pretendard Variable", font_size=30, color=ManimColor(ACCENT), weight=BOLD).shift(UP * 3.2)
        self.play(Write(title), run_time=0.4)

        # 마크다운 파일 이름
        filename = Text("src/harnesses/category_3_clarity.md", font="Pretendard Variable", font_size=14, color=ManimColor(MUTED)).shift(UP * 2.5)
        self.play(FadeIn(filename, shift=DOWN * 0.15), run_time=0.3)

        # 하네스 YAML 부분
        yaml_lines = [
            ("harness_id", ": category_3_clarity"),
            ("category", ': "3. 개념 설명 명확성"'),
            ("items", ":"),
            ("  - item_id", ': "3.2"'),
            ("    name", ': "비유 및 예시 활용"'),
            ("    weight", ": HIGH"),
            ("    chunk_focus", ": all"),
        ]

        code_group = VGroup()
        for key, val in yaml_lines:
            line = VGroup(
                Text(key, font="Pretendard Variable", font_size=15, color=ManimColor(ACCENT)),
                Text(val, font="Pretendard Variable", font_size=15, color=ManimColor(SUB)),
            ).arrange(RIGHT, buff=0)
            code_group.add(line)

        code_group.arrange(DOWN, buff=0.2, aligned_edge=LEFT).shift(UP * 0.3)

        for i, line in enumerate(code_group):
            self.play(FadeIn(line, shift=RIGHT * 0.2), run_time=0.15)

        self.wait(0.5)

        # "비유 및 예시 활용" 하이라이트
        highlight = SurroundingRectangle(code_group[4], color=ManimColor(ACCENT), buff=0.08, corner_radius=0.05, stroke_width=2)
        self.play(Create(highlight), run_time=0.3)

        # 확대 — 점수 기준 설명
        self.play(
            FadeOut(code_group[:4]), FadeOut(code_group[5:]),
            FadeOut(filename), FadeOut(highlight),
            code_group[4].animate.move_to(UP * 2.5).scale(1.3),
            run_time=0.5,
        )

        # 점수 기준 바
        sub_title = Text("어려운 개념에 적절한 비유나 실생활 예시를 활용하는가", font="Pretendard Variable", font_size=16, color=ManimColor(SUB)).shift(UP * 1.5)
        self.play(FadeIn(sub_title, shift=UP * 0.1), run_time=0.3)

        scores_data = [
            (5, "매번 풍부하게 사용", 1.0),
            (4, "자주 활용, 이해에 도움", 0.8),
            (3, "있으나 빈도 낮음", 0.6),
            (2, "거의 없어 추상적 설명에 의존", 0.4),
            (1, "전혀 없이 용어만으로 설명", 0.2),
        ]

        score_group = VGroup()
        for s, desc, w in scores_data:
            row = VGroup()
            # 점수 뱃지
            badge = RoundedRectangle(width=0.5, height=0.5, corner_radius=0.08, fill_color=ManimColor(ACCENT), fill_opacity=s * 0.2, stroke_width=0)
            badge_t = Text(str(s), font="Pretendard Variable", font_size=18, color=ManimColor(BLACK if s <= 3 else WHITE), weight=BOLD).move_to(badge)

            # 바
            track = RoundedRectangle(width=8, height=0.35, corner_radius=0.06, fill_color=ManimColor(LINE), fill_opacity=1, stroke_width=0)
            fill = RoundedRectangle(width=8 * w, height=0.35, corner_radius=0.06, fill_color=ManimColor(ACCENT), fill_opacity=0.15 + s * 0.17, stroke_width=0)
            fill.align_to(track, LEFT)

            # 설명
            label = Text(desc, font="Pretendard Variable", font_size=13, color=ManimColor(SUB))

            row.add(VGroup(badge, badge_t), VGroup(track, fill), label)
            row.arrange(RIGHT, buff=0.3)
            score_group.add(row)

        score_group.arrange(DOWN, buff=0.25).shift(DOWN * 0.5)

        for i, row in enumerate(score_group):
            self.play(FadeIn(row, shift=LEFT * 0.2), run_time=0.2)

        self.wait(1)
