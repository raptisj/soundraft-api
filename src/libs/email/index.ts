import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

type SendOptionProps = {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
};

const send = async (options: SendOptionProps) => {
  const { data, error } = await resend.emails.send({
    from: "Soundraft <send@soundraft.app>",
    ...options,
  });

  return { data, error };
};

const email = {
  send,
};

export { email };
