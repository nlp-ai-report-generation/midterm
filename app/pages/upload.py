"""Upload page."""

from __future__ import annotations

import streamlit as st


st.title("Upload Transcript")
st.file_uploader("Upload STT transcript", type=["txt", "md"])
