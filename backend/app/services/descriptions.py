from sqlalchemy.orm import Session
from openai import OpenAI
from app.core.config import settings
from app.models.player import Player

def generate_description(db: Session, player_id: int) -> Player:
    player = db.query(Player).filter(Player.id == player_id).one()
    if player.description:
        return player

    if not settings.OPENAI_API_KEY:
        player.description = "No LLM key configured. Set OPENAI_API_KEY to generate descriptions."
        db.commit()
        return player

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = f"""
Write a short scouting-style description (2-4 sentences) of this baseball player based ONLY on the provided JSON.
Be factual to the data; if a detail is missing, don’t invent it. Mention strengths in hits/home runs if present.

Player JSON:
{player.raw}
""".strip()

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content": prompt}],
        temperature=0.4,
    )

    player.description = resp.choices[0].message.content.strip()
    db.commit()
    return player
