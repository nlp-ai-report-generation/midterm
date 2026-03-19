from src.llm_analysis.client import create_client


def test_create_client_openai() -> None:
    client = create_client("openai", "gpt-4o-mini")
    output = client.complete("hello")
    assert "openai" in output
