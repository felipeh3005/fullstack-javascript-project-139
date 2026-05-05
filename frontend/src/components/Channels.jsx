import {
  Button,
  ListGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectChannels,
  selectCurrentChannelId,
  setCurrentChannelId,
} from '../slices/chatSlice';

const Channels = () => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannels) ?? [];
  const currentChannelId = useSelector(selectCurrentChannelId);

  return (
    <div className="h-100 border-end bg-light">
      <div className="p-3 border-bottom">
        <b>Channels</b>
      </div>

      <ListGroup variant="flush">
        {channels.map((channel) => {
          const active = channel.id === currentChannelId;

          return (
            <ListGroup.Item key={channel.id} className="p-0 border-0">
              <Button
                type="button"
                variant={active ? 'secondary' : 'light'}
                className="w-100 rounded-0 text-start"
                onClick={() => dispatch(setCurrentChannelId(channel.id))}
              >
                <span className="me-1">#</span>
                {channel.name}
              </Button>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default Channels;