import {
  Button,
  ButtonGroup,
  Dropdown,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectChannels,
  selectCurrentChannelId,
  setCurrentChannelId,
} from '../slices/chatSlice';

const Channels = ({
  onAddChannel,
  onRemoveChannel,
  onRenameChannel,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const channels = useSelector(selectChannels) ?? [];
  const currentChannelId = useSelector(selectCurrentChannelId);

  const handleChannelClick = (channelId) => {
    dispatch(setCurrentChannelId(channelId));
  };

  return (
    <div className="h-100 d-flex flex-column bg-light border-end">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <span className="fw-bold">{t('chat.channels')}</span>
        <Button
          type="button"
          size="sm"
          variant="outline-primary"
          aria-label={t('chat.addChannel')}
          onClick={onAddChannel}
        >
          +
        </Button>
      </div>

      <nav className="overflow-auto px-2 py-2">
        {channels.map((channel) => {
          const isActive = String(channel.id) === String(currentChannelId);
          const channelName = `# ${channel.name}`;
          const buttonVariant = isActive ? 'secondary' : 'light';

          if (channel.removable) {
            return (
              <Dropdown
                as={ButtonGroup}
                className="d-flex w-100 mb-1"
                key={channel.id}
              >
                <Button
                  type="button"
                  variant={buttonVariant}
                  className="text-start text-truncate flex-grow-1 border-0"
                  title={channelName}
                  aria-label={t('chat.selectChannel', { name: channel.name })}
                  onClick={() => handleChannelClick(channel.id)}
                >
                  <span className="text-truncate d-block">
                    {channelName}
                  </span>
                </Button>

                <Dropdown.Toggle
                  split
                  variant={buttonVariant}
                  className="flex-grow-0 border-0"
                  id={`channel-controls-${channel.id}`}
                  aria-label={t('chat.channelControls', { name: channel.name })}
                />

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onRenameChannel(channel)}>
                    {t('chat.rename')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onRemoveChannel(channel)}>
                    {t('chat.remove')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            );
          }

          return (
            <Button
              key={channel.id}
              type="button"
              variant={buttonVariant}
              className="w-100 text-start text-truncate mb-1 border-0"
              title={channelName}
              aria-label={t('chat.selectChannel', { name: channel.name })}
              onClick={() => handleChannelClick(channel.id)}
            >
              {channelName}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Channels;