#!/usr/bin/env python3
"""Greenwave sonic identity: kalimba, marimba, shaker and warm bass, synthesised with numpy.

Every score reads the page's exported cues (render.mjs --events), so each sound sits on its frame.

    python3 engine/audio.py out/anthem.events.json anthem out/anthem.wav
"""
import json
import sys
import wave

import numpy as np

SR = 48000
RNG = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(n, a=0.003, tau=0.3):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


# ---------------- instruments ----------------
def modal(f, partials, d, click=0.0):
    t = tt(d)
    y = np.zeros_like(t)
    for ratio, amp, tau in partials:
        if f * ratio < SR / 2.2:
            y += amp * np.sin(2 * np.pi * f * ratio * t + RNG.uniform(0, 0.3)) * np.exp(-t / tau)
    na = int(0.002 * SR)
    y[:na] *= np.linspace(0, 1, na)
    if click:
        c = fft_filter(RNG.standard_normal(int(0.006 * SR)), lo=2000) * click
        y[: len(c)] += c * np.linspace(1, 0, len(c))
    return y


def kalimba(n, d=1.8):
    return modal(midi(n), [(1, 1, 0.75), (2.0, 0.08, 0.3), (5.43, 0.22, 0.09), (8.9, 0.06, 0.04)], d, click=0.15)


def marimba(n, d=1.2):
    return modal(midi(n), [(1, 1, 0.42), (3.93, 0.3, 0.07), (9.2, 0.08, 0.02)], d, click=0.08)


def bass(n, d=0.6):
    t = tt(d + 0.1)
    f = midi(n)
    y = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.18 * np.sin(6 * np.pi * f * t)
    e = env(len(t), 0.006, 0.45)
    rel = int(0.08 * SR)
    e[-rel:] *= np.linspace(1, 0, rel)
    return np.tanh(1.6 * y * e) * 0.7


def kick(d=0.5):
    t = tt(d)
    f = 48 + 100 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t / 0.22)
    c = RNG.standard_normal(int(0.004 * SR)) * 0.3
    y[: len(c)] += c
    return np.tanh(1.5 * y)


def clap():
    n = int(0.25 * SR)
    y = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        seg = RNG.standard_normal(n - i) * env(n - i, 0.001, 0.012 if k < 2 else 0.07)
        y[i:] += seg
    return fft_filter(y, lo=900, hi=5000) * 0.8


def shaker(accent=1.0):
    n = int(0.09 * SR)
    y = RNG.standard_normal(n) * env(n, 0.004, 0.025)
    return fft_filter(y, lo=6000) * 0.5 * accent


def pad(notes, d, cutoff=2200, attack=0.8, release=1.0):
    t = tt(d)
    y = np.zeros_like(t)
    for n in notes:
        for det in (-0.0025, 0.0, 0.0025):
            f = midi(n) * (1 + det)
            for h in range(1, 9):
                if f * h > cutoff * 2:
                    break
                y += np.sin(2 * np.pi * f * h * t + RNG.uniform(0, 6.28)) / h
    y = fft_filter(y, hi=cutoff)
    e = np.ones_like(t)
    na, nr = int(attack * SR), int(min(release, d / 2) * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return y * e / (len(notes) * 6)


def noise_sweep(d, f0, f1, shape=1.0):
    n = int(d * SR)
    y = np.zeros(n)
    blocks = 16
    raw = RNG.standard_normal(n)
    for b in range(blocks):
        fc = f0 * (f1 / f0) ** (b / (blocks - 1))
        part = fft_filter(raw, lo=fc * 0.6, hi=fc * 1.6)
        w = np.clip(1 - np.abs(np.linspace(0, blocks - 1, n) - b), 0, 1)
        y += part * w
    return y


def riser(d):
    y = noise_sweep(d, 300, 9000)
    t = tt(d)[: len(y)]
    glide = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t / d)) / SR) * 0.15
    e = (t / d) ** 2.2
    return (y * 0.6 + glide) * e


def whoosh(d=0.7):
    y = noise_sweep(d, 3500, 500)
    t = np.linspace(0, 1, len(y))
    return y * np.sin(np.pi * t) ** 2 * 0.7


def crash(d=2.0):
    n = int(d * SR)
    return fft_filter(RNG.standard_normal(n), lo=4500) * env(n, 0.002, 0.5) * 0.45


def boom(d=2.2):
    t = tt(d)
    f = 38 + 60 * np.exp(-t / 0.08)
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)) * 0.9


def tick():
    n = int(0.02 * SR)
    return fft_filter(RNG.standard_normal(n), lo=3000, hi=9000) * env(n, 0.0005, 0.003) * 0.6


def rustle(d=0.35):
    n = int(d * SR)
    y = RNG.standard_normal(n) * (0.4 + 0.6 * np.abs(np.sin(np.linspace(0, 18, n))))
    return fft_filter(y, lo=2500, hi=8000) * np.sin(np.linspace(0, np.pi, n)) * 0.25


# ---------------- mixing ----------------
class Mix:
    def __init__(self, dur, tail=2.0):
        self.dur = dur
        n = int((dur + tail) * SR)
        self.dry = np.zeros((2, n))
        self.wet = np.zeros((2, n))

    def add(self, y, t, gain=1.0, pan=0.0, verb=0.25):
        i = int(round(t * SR))
        if i < 0:
            y, i = y[-i:], 0
        j = min(self.dry.shape[1], i + len(y))
        if j <= i:
            return
        y = y[: j - i] * gain
        th = (pan + 1) * np.pi / 4
        for ch, g in enumerate((np.cos(th), np.sin(th))):
            self.dry[ch, i:j] += y * g
            self.wet[ch, i:j] += y * g * verb

    def render(self, out, fade=1.0):
        n = self.dry.shape[1]
        ir_t = tt(2.2)
        out_buf = self.dry.copy()
        for ch in range(2):
            ir = RNG.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.55)
            ir = fft_filter(ir, lo=200, hi=6000)
            ir /= np.sqrt(np.sum(ir ** 2))
            L = n + len(ir)
            nfft = 1 << (L - 1).bit_length()
            w = np.fft.irfft(np.fft.rfft(self.wet[ch], nfft) * np.fft.rfft(ir, nfft), nfft)[:n]
            out_buf[ch] += w * 0.9
        out_buf = out_buf[:, : int(self.dur * SR)]
        nf = int(fade * SR)
        out_buf[:, -nf:] *= np.linspace(1, 0, nf) ** 1.5
        peak = np.max(np.abs(out_buf)) or 1
        out_buf = np.tanh(out_buf / peak * 1.4) / np.tanh(1.4) * 0.9
        pcm = (out_buf.T * 32767).astype('<i2')
        with wave.open(out, 'wb') as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())


# Key of D major. One chord per bar: D, Bm, G, A.
CHORDS = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]
BASS = [38, 35, 31, 33]
PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86]
OSTINATO = [0, 2, 1, 2, 3, 2, 1, 2]  # chord-tone index per eighth (3 = root up an octave)


def groove(mx, t0, bars, bar, chord_i, layers, gain=1.0):
    """Lay down `bars` bars of the house groove from t0. layers: set of {'kal','shk','bass','kick','clap','mar'}."""
    beat = bar / 4
    for b in range(bars):
        tb = t0 + b * bar
        ci = (chord_i + b) % 4
        ch = CHORDS[ci]
        if 'kal' in layers:
            for k, idx in enumerate(OSTINATO):
                if k == 5 and b % 2:
                    continue
                n = (ch[idx] if idx < 3 else ch[0] + 12) + 12
                mx.add(kalimba(n), tb + k * beat / 2, 0.24 * gain * (1.0 if k % 2 == 0 else 0.75), pan=(-0.35 if k % 2 else 0.35), verb=0.35)
        if 'shk' in layers:
            for k in range(16):
                mx.add(shaker(1.0 if k % 4 == 2 else 0.55), tb + k * beat / 4, 0.32 * gain, pan=0.45, verb=0.1)
        if 'bass' in layers:
            for off, d in ((0, beat * 1.4), (beat * 1.5, beat * 0.4), (beat * 2, beat * 1.4), (beat * 3.5, beat * 0.4)):
                mx.add(bass(BASS[ci] + (12 if off == beat * 3.5 else 0), d), tb + off, 0.3 * gain, verb=0.02)
        if 'kick' in layers:
            for off in (0, beat * 1.5, beat * 2, beat * 3.75 if b % 2 else beat * 3):
                mx.add(kick(), tb + off, 0.5 * gain, verb=0.03)
        if 'clap' in layers:
            for off in (beat, beat * 3):
                mx.add(clap(), tb + off, 0.32 * gain, pan=-0.1, verb=0.3)
        if 'mar' in layers:
            line = [ch[0] - 12 + 12, ch[1], ch[2], ch[1]]
            for k, n in enumerate(line):
                mx.add(marimba(n), tb + beat * (k + 0.5), 0.26 * gain, pan=-0.4, verb=0.3)


def score_anthem(cues):
    TL = cues['TL']
    bar, dur = TL['bar'], TL['dur']
    mx = Mix(dur)
    beat = bar / 4
    for b in range(12):
        t0 = b * bar
        if b == 5:
            mx.add(pad(CHORDS[1] + [CHORDS[1][0] + 12], bar - 0.5, cutoff=1400, attack=0.4, release=0.5), t0, 0.5)
        elif b < 10:
            mx.add(pad(CHORDS[b % 4], bar + 0.6, cutoff=1300 if b < 3 else 2400, attack=0.5 if b else 1.2, release=0.7), t0, 0.42 if b < 8 else 0.5)
    # bar 1–2: ostinato wakes up
    groove(mx, bar, 2, bar, 1, {'kal'}, 0.7)
    groove(mx, bar * 1.5, 1, bar, 1, {'shk'}, 0.5)
    groove(mx, bar * 2, 1, bar, 2, {'bass'}, 0.7)
    # bars 3–4: the groove lands with the hills
    groove(mx, bar * 3, 2, bar, 3, {'kal', 'shk', 'bass', 'kick', 'clap', 'mar'}, 0.9)
    # bars 6–7: the rally
    groove(mx, bar * 6, 2, bar, 2, {'kal', 'shk', 'bass', 'kick', 'clap', 'mar'}, 1.0)
    # bars 8–9: the fold, drums thin out under the riser
    groove(mx, bar * 8, 2, bar, 0, {'kal', 'bass'}, 0.75)
    groove(mx, bar * 8, 1, bar, 0, {'shk', 'kick'}, 0.7)
    # bars 10–11: resolution
    mx.add(pad([62, 66, 69, 76], bar * 2 + 1.5, cutoff=2600, attack=0.05, release=2.0), 25.0, 0.6)
    groove(mx, 25.0 + bar * 0.5, 1, bar, 0, {'shk'}, 0.4)
    for k, n in enumerate([74, 81, 78, 74, 76, 74]):
        mx.add(kalimba(n, 2.4), 25.0 + beat * (1 + k * 1.5), 0.2, pan=(-0.3 + 0.12 * k), verb=0.5)
    for k in range(3):
        mx.add(bass(38, bar * 0.9), 25.0 + k * bar * 0.5, 0.3 * (1 - k * 0.3))

    for e in cues['EV']:
        t, ty, pan = e['t'], e['type'], e.get('pan', 0)
        if ty == 'land':
            mx.add(kalimba(74, 3.0), t, 0.55, verb=0.6)
            mx.add(marimba(50, 2.0), t, 0.5, verb=0.4)
            mx.add(boom(1.2), t, 0.25)
        elif ty == 'pop':
            mx.add(kalimba(PENTA[int(abs(pan) * 9 + 2) % len(PENTA)] + 12, 0.6), t, 0.05, pan=pan, verb=0.4)
        elif ty == 'tree':
            mx.add(marimba(PENTA[int((pan + 1) * 4) % 6] - 12, 0.8), t, 0.12, pan=pan, verb=0.3)
            mx.add(rustle(), t, 0.25, pan=pan, verb=0.2)
        elif ty == 'tick':
            mx.add(tick(), t, 0.25, pan=0.2, verb=0.05)
        elif ty == 'light':
            mx.add(kalimba(PENTA[(e['i'] * 2) % len(PENTA)] + 12, 1.2), t, 0.13, pan=pan, verb=0.6)
        elif ty == 'word':
            mx.add(boom(1.4), t, 0.32)
            mx.add(crash(1.6 if e['i'] < 2 else 2.4), t, 0.35 + 0.1 * e['i'])
            mx.add(marimba([62, 66, 69][e['i']], 1.0), t, 0.35, verb=0.4)
        elif ty == 'block':
            mx.add(marimba(55 + PENTA.index(PENTA[e['i'] % len(PENTA)]) * 2, 0.4), t, 0.14, pan=0.5, verb=0.2)
        elif ty == 'whoosh':
            mx.add(whoosh(1.1), t - 0.3, 0.5, verb=0.4)
        elif ty == 'riser':
            mx.add(riser(e['dur']), t, 0.6, verb=0.3)
        elif ty == 'turbine':
            mx.add(whoosh(0.9), t, 0.3, pan=0.2)
        elif ty == 'hit':
            mx.add(boom(2.6), t, 0.7, verb=0.1)
            mx.add(crash(3.0), t, 0.55, verb=0.5)
            for n in (62, 69, 74, 78, 81):
                mx.add(kalimba(n, 3.0), t, 0.18, verb=0.6)
        elif ty == 'land2':
            mx.add(kalimba(86, 2.0), t, 0.35, verb=0.7)
            mx.add(marimba(62, 1.5), t, 0.25)
        elif ty == 'cta':
            mx.add(kalimba(81, 1.5), t, 0.2, verb=0.5)
            mx.add(kalimba(86, 1.5), t + beat / 2, 0.18, verb=0.5)
    # the two silences: before the drop and before the hit
    for s0, s1 in ((14.35, 15.0), (24.55, 25.0)):
        i0, i1 = int(s0 * SR), int(s1 * SR)
        ramp = int(0.04 * SR)
        mx.dry[:, i0:i1] *= 0.0
        mx.dry[:, i0 - ramp:i0] *= np.linspace(1, 0, ramp)
        mx.wet[:, i0:i1] *= 0.15
    return mx


def score_programmes(cues):
    TL = cues['TL']
    bar, dur = TL['bar'], TL['dur']
    beat = bar / 4
    mx = Mix(dur)
    nb = int(round(dur / bar))
    for b in range(nb):
        mx.add(pad(CHORDS[b % 4], bar + 0.6, cutoff=2400, attack=0.3, release=0.6), b * bar, 0.36)
    groove(mx, 0, 1, bar, 0, {'kal', 'shk'}, 0.8)
    groove(mx, bar, nb - 2, bar, 1, {'kal', 'shk', 'bass', 'kick', 'clap', 'mar'}, 0.95)
    mx.add(pad([62, 66, 69, 76], bar + 1.5, cutoff=2600, attack=0.05, release=1.5), (nb - 1) * bar, 0.55)
    for e in cues['EV']:
        t, ty = e['t'], e['type']
        if ty == 'wipe':
            mx.add(whoosh(0.6), t - 0.25, 0.55, pan=(0.4 if e.get('i', 0) % 2 else -0.4), verb=0.3)
        elif ty == 'card':
            mx.add(marimba(PENTA[e['i'] % len(PENTA)], 1.0), t, 0.3, verb=0.4)
            mx.add(boom(0.9), t, 0.3)
        elif ty == 'icon':
            mx.add(kalimba(PENTA[(e['i'] + 4) % len(PENTA)] + 12, 1.0), t, 0.14, verb=0.5)
        elif ty == 'hit':
            mx.add(boom(2.2), t, 0.9)
            mx.add(crash(2.4), t, 0.5, verb=0.5)
            for n in (62, 69, 74, 78):
                mx.add(kalimba(n, 2.4), t, 0.18, verb=0.6)
        elif ty == 'cta':
            mx.add(kalimba(81, 1.5), t, 0.2, verb=0.5)
    return mx


if __name__ == '__main__':
    cues = json.load(open(sys.argv[1]))
    film = sys.argv[2]
    mx = {'anthem': score_anthem, 'programmes': score_programmes}[film](cues)
    mx.render(sys.argv[3])
    print(f'score → {sys.argv[3]}')
