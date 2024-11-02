import { Resend } from "resend";

const resend = new Resend("re_BNpQ3RDr_5Ng5UqfQ677vS496waLUh8Ec");

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
