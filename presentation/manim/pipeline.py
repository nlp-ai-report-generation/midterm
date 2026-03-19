"""파이프라인 플로우 애니메이션 — 3Blue1Brown 스타일"""
from manim import *

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30
config.background_color = WHITE

ORANGE = "#FF6B00"
BLACK = "#0F172A"
GRAY = "#94A3B8"
LIGHT = "#F1F5F9"


class PipelineFlow(Scene):
    def construct(self):
        # ── 1. 텍스트 데이터 등장 ──
        raw_text = Text(
            '"안녕하세요, 오늘은 Java I/O 패키지에 대해\n설명드리겠습니다. 먼저 입출력 스트림의\n기본 개념부터 살펴보겠습니다..."',
            font="Pretendard Variable",
            font_size=24,
            color=ManimColor(BLACK),
            line_spacing=1.4,
        ).shift(UP * 2)

        label_stt = Text("STT 스크립트 (22,756줄)", font="Pretendard Variable", font_size=18, color=ManimColor(GRAY)).next_to(raw_text, UP, buff=0.3)

        self.play(FadeIn(label_stt, shift=DOWN * 0.3), run_time=0.5)
        self.play(Write(raw_text), run_time=1.5)
        self.wait(0.5)

        # ── 2. 청킹 — 30분 블록으로 분리 ──
        chunks = VGroup()
        chunk_labels = ["청크 1\n00:00~00:30", "청크 2\n00:25~00:55", "청크 3\n00:50~01:20", "...", "청크 N"]
        for i, label in enumerate(chunk_labels):
            rect = RoundedRectangle(
                width=2.2, height=1.2, corner_radius=0.15,
                fill_color=ManimColor(LIGHT), fill_opacity=1,
                stroke_color=ManimColor(ORANGE) if i < 3 else ManimColor(GRAY),
                stroke_width=2,
            )
            txt = Text(label, font="Pretendard Variable", font_size=14, color=ManimColor(BLACK)).move_to(rect)
            chunks.add(VGroup(rect, txt))
        chunks.arrange(RIGHT, buff=0.3).move_to(ORIGIN)

        self.play(
            FadeOut(raw_text),
            FadeOut(label_stt),
            run_time=0.4,
        )

        label_chunk = Text("30분 윈도우 · 5분 오버랩", font="Pretendard Variable", font_size=18, color=ManimColor(ORANGE)).shift(UP * 2.5)
        self.play(FadeIn(label_chunk, shift=DOWN * 0.3), run_time=0.4)

        for i, chunk in enumerate(chunks):
            self.play(FadeIn(chunk, shift=UP * 0.3), run_time=0.25)

        # 오버랩 표시
        overlap1 = Rectangle(width=0.6, height=1.2, fill_color=ManimColor(ORANGE), fill_opacity=0.15, stroke_width=0)
        overlap1.move_to(chunks[0].get_right() + LEFT * 0.3)
        overlap2 = overlap1.copy().move_to(chunks[1].get_right() + LEFT * 0.3)
        self.play(FadeIn(overlap1), FadeIn(overlap2), run_time=0.4)
        self.wait(0.5)

        # ── 3. Fan-out — 5개 평가자 ──
        self.play(FadeOut(chunks), FadeOut(overlap1), FadeOut(overlap2), FadeOut(label_chunk), run_time=0.4)

        categories = ["언어 표현 품질", "강의 구조", "개념 명확성", "예시/실습", "상호작용"]
        cat_nodes = VGroup()
        for i, cat in enumerate(categories):
            circle = Circle(radius=0.6, fill_color=ManimColor(ORANGE), fill_opacity=0.15, stroke_color=ManimColor(ORANGE), stroke_width=2)
            txt = Text(cat, font="Pretendard Variable", font_size=13, color=ManimColor(BLACK)).move_to(circle)
            cat_nodes.add(VGroup(circle, txt))

        cat_nodes.arrange(RIGHT, buff=0.8).shift(DOWN * 0.5)

        # 중앙 입력 노드
        input_node = Circle(radius=0.5, fill_color=ManimColor(ORANGE), fill_opacity=1, stroke_width=0).shift(UP * 2)
        input_label = Text("청크", font="Pretendard Variable", font_size=16, color=WHITE).move_to(input_node)

        self.play(FadeIn(input_node), FadeIn(input_label), run_time=0.4)

        # fan-out 화살표
        arrows = VGroup()
        for node in cat_nodes:
            arrow = Arrow(input_node.get_bottom(), node.get_top(), buff=0.15, color=ManimColor(ORANGE), stroke_width=2)
            arrows.add(arrow)

        self.play(*[GrowArrow(a) for a in arrows], run_time=0.6)
        self.play(*[FadeIn(n, shift=DOWN * 0.2) for n in cat_nodes], run_time=0.5)
        self.wait(0.3)

        # ── 4. 집계 ──
        agg_node = RoundedRectangle(width=3, height=0.8, corner_radius=0.15, fill_color=ManimColor(ORANGE), fill_opacity=1, stroke_width=0).shift(DOWN * 2.5)
        agg_label = Text("가중 평균 집계", font="Pretendard Variable", font_size=16, color=WHITE).move_to(agg_node)

        arrows2 = VGroup()
        for node in cat_nodes:
            arrow = Arrow(node.get_bottom(), agg_node.get_top(), buff=0.15, color=ManimColor(GRAY), stroke_width=1.5)
            arrows2.add(arrow)

        self.play(*[GrowArrow(a) for a in arrows2], run_time=0.5)
        self.play(FadeIn(agg_node), FadeIn(agg_label), run_time=0.4)

        # 최종 점수
        score = Text("3.24 / 5.0", font="Pretendard Variable", font_size=36, color=ManimColor(ORANGE), weight=BOLD).shift(DOWN * 3.5)
        self.play(Write(score), run_time=0.5)
        self.wait(1)


class ICCPrinciple(Scene):
    """ICC 원리 — 같은 강의를 3번 채점하면 점수가 얼마나 같은지"""
    def construct(self):
        title = Text("ICC: 반복 평가 일관성", font="Pretendard Variable", font_size=32, color=ManimColor(BLACK), weight=BOLD).shift(UP * 3)
        self.play(Write(title), run_time=0.5)

        # 3번 채점 결과
        axes = Axes(
            x_range=[0, 18, 1], y_range=[1, 5, 1],
            x_length=10, y_length=4,
            axis_config={"color": ManimColor(GRAY), "include_numbers": False},
        ).shift(DOWN * 0.5)

        x_label = Text("18개 평가 항목", font="Pretendard Variable", font_size=14, color=ManimColor(GRAY)).next_to(axes, DOWN, buff=0.3)
        y_label = Text("점수", font="Pretendard Variable", font_size=14, color=ManimColor(GRAY)).next_to(axes, LEFT, buff=0.3)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), run_time=0.6)

        # 3번의 점수 (거의 비슷하게)
        import random
        random.seed(42)
        base_scores = [3, 4, 3, 2, 4, 3, 3, 5, 4, 3, 4, 3, 2, 3, 4, 3, 4, 3]

        colors = [ORANGE, "#FFB380", "#FFD6B3"]
        labels = ["1회차", "2회차", "3회차"]
        dots_groups = []

        for trial in range(3):
            dots = VGroup()
            scores = [min(5, max(1, s + random.choice([-1, 0, 0, 0, 0, 1]))) for s in base_scores]
            for i, s in enumerate(scores):
                dot = Dot(axes.c2p(i + 0.5, s), radius=0.06, color=ManimColor(colors[trial]))
                dots.add(dot)
            dots_groups.append(dots)

            label = Text(labels[trial], font="Pretendard Variable", font_size=14, color=ManimColor(colors[trial])).shift(RIGHT * 5 + DOWN * (trial - 1) * 0.5)
            self.play(FadeIn(dots, shift=UP * 0.1), FadeIn(label), run_time=0.5)

        self.wait(0.3)

        # ICC 결과
        result = Text("ICC = 0.877 (Good)", font="Pretendard Variable", font_size=28, color=ManimColor(ORANGE), weight=BOLD).shift(DOWN * 3.2)
        desc = Text("점수가 거의 겹칩니다 → 신뢰할 수 있는 측정입니다", font="Pretendard Variable", font_size=16, color=ManimColor(GRAY)).next_to(result, DOWN, buff=0.2)
        self.play(Write(result), run_time=0.5)
        self.play(FadeIn(desc, shift=UP * 0.2), run_time=0.4)
        self.wait(1)


class ArchitectureDiagram(Scene):
    """전체 시스템 아키텍처"""
    def construct(self):
        title = Text("시스템 구조", font="Pretendard Variable", font_size=32, color=ManimColor(BLACK), weight=BOLD).shift(UP * 3.2)
        self.play(Write(title), run_time=0.4)

        # 입력
        input_box = RoundedRectangle(width=2.5, height=1, corner_radius=0.15, fill_color=ManimColor(LIGHT), fill_opacity=1, stroke_color=ManimColor(GRAY), stroke_width=1.5).shift(LEFT * 5 + UP * 0.5)
        input_txt = Text("STT 스크립트\n15개 강의", font="Pretendard Variable", font_size=13, color=ManimColor(BLACK)).move_to(input_box)
        self.play(FadeIn(input_box), FadeIn(input_txt), run_time=0.4)

        # 파이프라인
        pipe_box = RoundedRectangle(width=3, height=1.5, corner_radius=0.15, fill_color=ManimColor(ORANGE), fill_opacity=1, stroke_width=0).shift(LEFT * 1 + UP * 0.5)
        pipe_txt = Text("LangGraph\n파이프라인", font="Pretendard Variable", font_size=15, color=WHITE, weight=BOLD).move_to(pipe_box)
        pipe_sub = Text("전처리 → 병렬 평가 → 집계 → 리포트", font="Pretendard Variable", font_size=10, color=ManimColor("#FFD6B3")).next_to(pipe_box, DOWN, buff=0.1)

        arrow1 = Arrow(input_box.get_right(), pipe_box.get_left(), buff=0.15, color=ManimColor(ORANGE), stroke_width=2)
        self.play(GrowArrow(arrow1), run_time=0.3)
        self.play(FadeIn(pipe_box), FadeIn(pipe_txt), FadeIn(pipe_sub), run_time=0.4)

        # 두 갈래 출력
        op_box = RoundedRectangle(width=2.5, height=1, corner_radius=0.15, fill_color=ManimColor(LIGHT), fill_opacity=1, stroke_color=ManimColor(ORANGE), stroke_width=1.5).shift(RIGHT * 3.5 + UP * 1.5)
        op_txt = Text("운영자 뷰\n대시보드 · 분석 · 검증", font="Pretendard Variable", font_size=12, color=ManimColor(BLACK)).move_to(op_box)

        inst_box = RoundedRectangle(width=2.5, height=1, corner_radius=0.15, fill_color=ManimColor(LIGHT), fill_opacity=1, stroke_color=ManimColor(ORANGE), stroke_width=1.5).shift(RIGHT * 3.5 + DOWN * 0.5)
        inst_txt = Text("강사 뷰\n내 강의 · 추이 · 캘린더", font="Pretendard Variable", font_size=12, color=ManimColor(BLACK)).move_to(inst_box)

        arrow2 = Arrow(pipe_box.get_right(), op_box.get_left(), buff=0.15, color=ManimColor(ORANGE), stroke_width=2)
        arrow3 = Arrow(pipe_box.get_right(), inst_box.get_left(), buff=0.15, color=ManimColor(ORANGE), stroke_width=2)

        self.play(GrowArrow(arrow2), GrowArrow(arrow3), run_time=0.4)
        self.play(FadeIn(op_box), FadeIn(op_txt), FadeIn(inst_box), FadeIn(inst_txt), run_time=0.4)

        # 기술 스택
        stack = VGroup()
        techs = ["React 19", "Vite", "Tailwind", "FastAPI", "Supabase", "GitHub Actions"]
        for t in techs:
            label = Text(t, font="Pretendard Variable", font_size=11, color=ManimColor(GRAY))
            stack.add(label)
        stack.arrange(RIGHT, buff=0.5).shift(DOWN * 2.5)
        self.play(FadeIn(stack, shift=UP * 0.2), run_time=0.4)
        self.wait(1.5)
