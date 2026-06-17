from ..models import Friendship

def get_friendship_status(user, other_user):

    sent = Friendship.objects.filter(from_user=user, to_user=other_user).first()
    received = Friendship.objects.filter(from_user=other_user, to_user=user).first()

    if sent:

        if sent.status == 'pending':
            return 'pending_sent'

        if sent.status == 'accepted':
            return 'accepted'

    if received:

        if received.status == 'pending':
            return 'pending_received'

        if received.status == 'accepted':
            return 'accepted'

    return 'none'