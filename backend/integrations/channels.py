"""
Outbound notification channels (SMS / email / push).
TODO: wire up real providers (Twilio, SMTP, FCM, etc.) using env vars.
"""


def send_sms(to_number: str, message: str) -> bool:
    print(f"[SMS -> {to_number}] {message}")  # placeholder
    return True


def send_email(to_address: str, subject: str, body: str) -> bool:
    print(f"[EMAIL -> {to_address}] {subject}: {body}")  # placeholder
    return True


def notify_officer_channel(message: str) -> bool:
    """Broadcast a high-priority alert to on-duty officers via all channels."""
    print(f"[OFFICER NOTIFY] {message}")  # placeholder
    return True
