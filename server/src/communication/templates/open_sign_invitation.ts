const open_sign_invitation = ({
  receiver_name,
  sender_name,
  document_title,
  signingLink,
}) =>
  `<p>Hi ${receiver_name},</p><br><p>We hope this email finds you well. ${sender_name}&nbsp;has requested you to review and sign&nbsp;"<strong>${document_title}</strong>".</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href=${signingLink} target=_blank>Sign here</a></p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team EducationCA™</p><br>`;

export default open_sign_invitation;
