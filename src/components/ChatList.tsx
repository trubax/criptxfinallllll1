import ClickableAvatar from './common/ClickableAvatar';

// ... nel rendering delle chat ...

<div className="flex items-center gap-3">
  <ClickableAvatar
    photoURL={chat.photoURL}
    userId={chat.userId}
    displayName={chat.name}
    size="md"
    showStatus={true}
    status={chat.status}
  />
  {/* ... resto delle informazioni chat ... */}
</div> 