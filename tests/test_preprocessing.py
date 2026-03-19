from src.preprocessing.text_cleaner import clean_text


def test_clean_text_normalizes_spaces() -> None:
    assert clean_text("a   b\n c") == "a b c"
