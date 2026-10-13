from manim import *
import math

BG = "#080808"
MINT = "#71D9C1"
LAVENDER = "#8E92D9"
TEXT = "#F2F2F2"
MUTED = "#969696"


def normal(x, mean=0, sigma=1):
    return math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * math.sqrt(2 * math.pi))


class DistLabScene(Scene):
    def setup(self):
        self.camera.background_color = BG

    def axes(self, x_range=(-4, 4, 1), y_max=0.5):
        return Axes(x_range=[*x_range], y_range=[0, y_max, 0.1], x_length=10, y_length=4,
                    axis_config={"color": MUTED, "stroke_width": 1, "include_ticks": True},
                    y_axis_config={"include_numbers": False})

    def heading(self, title, subtitle=None):
        group = VGroup(Text(title, color=TEXT, font_size=32, weight=MEDIUM))
        if subtitle:
            group.add(Text(subtitle, color=MUTED, font_size=18).next_to(group[0], DOWN, buff=0.15))
        return group.arrange(DOWN).to_edge(UP)


class NormalDistributionBasics(DistLabScene):
    def construct(self):
        axes = self.axes()
        curve = axes.plot(normal, color=MINT, stroke_width=4)
        title = self.heading("The normal distribution", "A density curve: height is not probability")
        formula = MathTex(r"f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac12(\frac{x-\mu}{\sigma})^2}", color=TEXT).scale(0.75).to_corner(UR)
        self.play(Write(title), Create(axes), Create(curve), run_time=2)
        self.play(Write(formula))
        self.wait(1)


class MeanShift(DistLabScene):
    def construct(self):
        axes = self.axes((-6, 6, 2))
        tracker = ValueTracker(-2)
        curve = always_redraw(lambda: axes.plot(lambda x: normal(x, tracker.get_value()), color=MINT, stroke_width=4))
        marker = always_redraw(lambda: DashedLine(axes.c2p(tracker.get_value(), 0), axes.c2p(tracker.get_value(), .43), color=MINT))
        label = always_redraw(lambda: MathTex(rf"\mu={tracker.get_value():.1f}", color=TEXT).next_to(marker, UP))
        self.add(self.heading("Mean shifts location", "The shape stays fixed"), axes, curve, marker, label)
        self.play(tracker.animate.set_value(2), run_time=3, rate_func=smooth)
        self.wait()


class StandardDeviationAndSpread(DistLabScene):
    def construct(self):
        axes = self.axes((-6, 6, 2), .9)
        tracker = ValueTracker(.6)
        curve = always_redraw(lambda: axes.plot(lambda x: normal(x, 0, tracker.get_value()), color=MINT, stroke_width=4))
        label = always_redraw(lambda: MathTex(rf"\sigma={tracker.get_value():.1f}", color=TEXT).to_corner(UR))
        self.add(self.heading("Standard deviation controls spread", "Wider means lower: total area remains one"), axes, curve, label)
        self.play(tracker.animate.set_value(2), run_time=3)
        self.wait()


class AreaUnderCurve(DistLabScene):
    def construct(self):
        axes = self.axes()
        curve = axes.plot(normal, color=MINT, stroke_width=4)
        area = axes.get_area(curve, x_range=[-4, 4], color=MINT, opacity=.25)
        total = MathTex(r"\int_{-\infty}^{\infty} f(x)\,dx = 1", color=TEXT).to_corner(UR)
        self.play(Write(self.heading("Probability is area")), Create(axes), Create(curve))
        self.play(FadeIn(area), Write(total), run_time=2)
        self.wait()


class StudentTHeavyTails(DistLabScene):
    def construct(self):
        axes = self.axes((-5, 5, 1), .55)
        # ν=1 is the Cauchy density.
        t_curve = axes.plot(lambda x: 1 / (math.pi * (1 + x*x)), color=MINT, stroke_width=4)
        n_curve = axes.plot(normal, color=LAVENDER, stroke_width=3)
        labels = VGroup(Text("t, ν = 1", color=MINT, font_size=20), Text("normal", color=LAVENDER, font_size=20)).arrange(DOWN, aligned_edge=LEFT).to_corner(UR)
        self.play(Write(self.heading("Student's t has heavier tails")), Create(axes), Create(n_curve), Create(t_curve), Write(labels), run_time=2.5)
        self.wait()


class StudentTConvergesToNormal(DistLabScene):
    def construct(self):
        axes = self.axes()
        normal_curve = axes.plot(normal, color=LAVENDER, stroke_width=3)
        # Precomputed qualitative approximations are only for this visual lesson, not the calculator.
        curves = [axes.plot(lambda x, v=v: normal(x) * (1 + (x**4 - 2*x*x - 1) / (4*v)), color=MINT, stroke_width=4) for v in (2, 5, 15, 100)]
        label = MathTex(r"\nu=2", color=MINT).to_corner(UR)
        self.add(self.heading("As ν grows, t approaches normal"), axes, normal_curve, curves[0], label)
        for v, curve in zip((5, 15, 100), curves[1:]):
            next_label = MathTex(rf"\nu={v}", color=MINT).to_corner(UR)
            self.play(Transform(curves[0], curve), Transform(label, next_label), run_time=.9)
        self.wait()


class ZScoreStandardisation(DistLabScene):
    def construct(self):
        formula = MathTex(r"z=\frac{x-\mu}{\sigma}", color=TEXT).scale(1.6)
        examples = VGroup(MathTex(r"x=74", color=MINT), MathTex(r"\mu=70", color=MUTED), MathTex(r"\sigma=2", color=MUTED)).arrange(RIGHT, buff=.8).next_to(formula, DOWN)
        result = MathTex(r"z=2", color=MINT).scale(1.5).next_to(examples, DOWN, buff=.7)
        self.play(Write(self.heading("Z-score standardisation", "Measure distance in standard deviations")), Write(formula), Write(examples))
        self.play(TransformFromCopy(formula, result))
        self.wait()


class ProbabilityBounds(DistLabScene):
    def construct(self):
        axes = self.axes()
        curve = axes.plot(normal, color=MINT, stroke_width=4)
        area = axes.get_area(curve, x_range=[-1, 1.5], color=MINT, opacity=.3)
        a = DashedLine(axes.c2p(-1, 0), axes.c2p(-1, normal(-1)), color=TEXT)
        b = DashedLine(axes.c2p(1.5, 0), axes.c2p(1.5, normal(1.5)), color=TEXT)
        formula = MathTex(r"P(a\le X\le b)=F(b)-F(a)", color=TEXT).to_corner(UR)
        self.play(Write(self.heading("Bounds become area")), Create(axes), Create(curve))
        self.play(Create(a), Create(b), FadeIn(area), Write(formula), run_time=2)
        self.wait()


class Central68Rule(DistLabScene):
    def construct(self):
        axes = self.axes()
        curve = axes.plot(normal, color=MINT, stroke_width=4)
        area = axes.get_area(curve, x_range=[-1, 1], color=MINT, opacity=.3)
        label = MathTex(r"P(-1\le Z\le1)\approx68.27\%", color=TEXT).to_corner(UR)
        self.play(Write(self.heading("The central 68% rule")), Create(axes), Create(curve), FadeIn(area), Write(label), run_time=2)
        self.wait()


class Central95Rule(DistLabScene):
    def construct(self):
        axes = self.axes()
        curve = axes.plot(normal, color=MINT, stroke_width=4)
        area = axes.get_area(curve, x_range=[-1.96, 1.96], color=MINT, opacity=.3)
        label = MathTex(r"P(-1.96\le Z\le1.96)\approx95\%", color=TEXT).to_corner(UR)
        self.play(Write(self.heading("The central 95% rule")), Create(axes), Create(curve), FadeIn(area), Write(label), run_time=2)
        self.wait()
