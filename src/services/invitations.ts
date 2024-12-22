import { db } from "../config/db";
import { isProd } from "../utils";
import { email } from "../libs/email";

const template = (url: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Effortless Feedback for your Audio.<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
  </div>

  <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px">
      <tbody>
        <tr style="width:100%">
          <td>
            <h1 style="text-align:center;margin-top:0px;margin-bottom:0px;line-height:2rem">Soundraft</h1>
            <p style="font-size:16px;line-height:26px;margin:16px 0">Hi 👋 </p>
            <p style="font-size:16px;line-height:26px;margin:16px 0">You've been invited to join a project in Soundraft. Accept the invitation and let the collaboration begin.</p>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center">
              <tbody>
                <tr>
                  <td><a href=${url} style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#9AE6B4;border-radius:3px;color:#183d26;font-size:16px;text-align:center;padding:12px 12px 12px 12px" target="_blank"><span><!--[if mso]><i style="mso-font-width:300%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Get started</span><span><!--[if mso]><i style="mso-font-width:300%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span></a></td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:16px;line-height:26px;margin:16px 0">Best,<br />Soundraft</p>
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#cccccc;margin:20px 0" />
          </td>
        </tr>
      </tbody>
    </table><!--/$-->
  </body>

</html>
`;

type CreateInvitationProps = {
  id: string;
  invited_email: string;
  role: string;
  has_account: boolean;
  role_type: string;
  invited_by: string;
  project_id: string;
  invitation_status: string;
};

export const create = async (payload: CreateInvitationProps) => {
  const {
    id,
    invited_email,
    role,
    has_account = false,
    role_type,
    invited_by,
    invitation_status,
    project_id,
  } = payload;

  const results = await db.query(
    "INSERT INTO invitations (id, invited_email, role, has_account, role_type, invited_by, invitation_status, project_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *;",
    [
      id,
      invited_email,
      role,
      has_account,
      role_type,
      invited_by,
      invitation_status,
      project_id,
    ]
  );

  return {
    data: results?.rows[0],
  };
};

type SendInvitationProps = {
  id: string;
  has_account: boolean;
  invited_email: string;
  role: string;
  project_id: string;
};
export const send = async (
  payload: SendInvitationProps
): Promise<{
  data: { id: string };
  error: { message: string; name: string };
}> => {
  const { id, has_account, invited_email, role, project_id } = payload;

  const inviteToken = btoa(
    JSON.stringify({ id, has_account, invited_email, role, project_id })
  );

  const url = `${process.env.CLIENT_APP_URL}/auth/accept-invitation/?invitation_token=${inviteToken}`;
  console.log(url, "url in email");

  // we don't want to send email from local
  if (!isProd()) {
    return { data: null, error: null };
  }

  const htmlTemplate = template(url);
  const { data, error } = await email.send({
    to: [invited_email],
    subject: "Invitation for Soundraft!",
    html: htmlTemplate,
  });

  return { data, error };
};

export const get = async (inviteToken: string) => {
  const decodedInvitation = JSON.parse(atob(inviteToken));
  const { id } = decodedInvitation;

  const results = await db.query("SELECT * FROM invitations WHERE id = $1;", [
    id,
  ]);

  return {
    data: results?.rows[0],
  };
};

export const accept = async (invitationId: string): Promise<unknown> => {
  await db.query(
    "UPDATE invitations SET invitation_status = $2 WHERE id = $1 RETURNING *;",
    [invitationId, "accepted"]
  );

  return {};
};

export const getList = async (projectId: string) => {
  const results = await db.query(
    "SELECT * FROM invitations WHERE project_id = $1 AND invitation_status = $2;",
    [projectId, "pending"]
  );

  return {
    data: results?.rows,
  };
};

export const revoke = async (id: string) => {
  try {
    await db.query("DELETE FROM invitations WHERE id = $1;", [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};
