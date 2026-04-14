# Path Loop Generator v2.7.1 (Full Architecture README)

(Expanded version)

---

# 0. Purpose

This version isolates **transient generation** from dynamic systems.

Goal:
- sharp local transients
- no sustained oscillation
- predictable behavior

---

# 1. Pipeline

3D path → projection → scalar signal → warp → buffer → granular → distortion → output

---

# 2. 3D Path

Closed curve parameterized by u ∈ [0,1]

Types:
- random spline
- pulse (circle + Ricker)

---

# 3. Signal Extraction

Modes:
- Source Z → intrinsic
- Display Y → camera dependent

---

# 4. Buffer

Sampled to fixed array, then normalized

Key effect:
→ removes amplitude differences
→ preserves geometry

---

# 5. Warp

Maps phase → arc-length → source index

Ensures perceptual uniformity

---

# 6. Granular Engine

Each grain:
- samples warped source
- applies Hann window
- overlap-add

---

# 7. Distortion

## Trigger

stress = |d(raw)/dt|

## Condition

stress > threshold && cooldown == 0

---

# 8. Spike

Short additive pulse:
- 0.5–2 ms
- signed
- decaying

---

# 9. Cooldown

Prevents repeated triggers

---

# 10. Behavior

Produces:
- sharp clicks
- stable positions
- no tonal artifacts

---

# 11. Visualization

Blue = source  
Orange = processed  
Red = triggers  

---

# 12. Limitations

- deterministic
- no evolution
- no feedback

---

# 13. Future

- output-based trigger
- stochastic variation
- improved impulse shapes

---

End.
