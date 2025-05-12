import emailjs from '@emailjs/browser';

export function sendInviteEmail(to_email, to_name, trip_name) {
  return emailjs.send(
    'service_7gpzfjq',
    'template_dl2uq6v',
    {
      to_email,
      to_name,
      trip_name
    },
    'QlIA9_4mrMcOxdFcK' // Your Public Key
  );
}
