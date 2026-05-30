import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
  authorizer: (channel: any) => ({
    authorize: (socketId: string, callback: (error: any, data: any) => void) => {
      import('./api').then(({ default: api }) => {
        api
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(null, response.data))
          .catch((error) => callback(error, null));
      });
    },
  }),
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
  wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
  wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
  forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

export default echo;
