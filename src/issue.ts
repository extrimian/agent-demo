import { CredentialFlow } from "@extrimian/agent";
import { initializeAgents } from "./agent";

async function issueCredential() {
  console.log("Initializing agents");
  const [issuerAgent, holderAgent, verifierAgent] = await initializeAgents();
  console.log("ISSUER DID: ", issuerAgent.identity.getOperationalDID().value);
  console.log("HOLDER DID: ", holderAgent.identity.getOperationalDID().value);

  // ISSUER
  console.log("ISSUER: Proceeding to create VC");
  const invitationMessage = await issuerAgent.vc.createInvitationMessage({
    flow: CredentialFlow.Issuance,
  });
  console.log("ISSUER: Invitation message:", invitationMessage);

  // HOLDER
  console.log("HOLDER: Processing invitation message...");
  holderAgent.vc.processMessage({
    message: invitationMessage,
  });

  holderAgent.vc.credentialArrived.on(async (data) => {
    if (data) {
      await Promise.all(
        data.credentials.map(async (vc) => {
          try {
            const result = await holderAgent.vc.verifyVC({
              vc: vc.data,
            });

            console.log("Verified VC:", result);
          } catch (error) {
            throw new Error(
              'Verifiable Credential did not pass verification',
            );
          }

          console.log('Credential arrived!', JSON.stringify(vc.data, null, 2));

          holderAgent.vc.saveCredentialWithInfo(vc.data, {
            styles: vc.styles,
            display: vc.display,
          });
        }),
      );
    }
  });
}

issueCredential();
