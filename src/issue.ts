import {
  CredentialFlow,
} from "@extrimian/agent";
import expect from "expect";
import { initializeAgents } from "./agent";

async function issueCredential() {
  console.log("Initializing agents");
  const [issuerAgent, holderAgent, verifierAgent] = await initializeAgents();

  console.log("Proceeding to create VC");
  // ISSUER
  console.log("ISSUER");
  const invitationMessage = await issuerAgent.vc.createInvitationMessage({
    flow: CredentialFlow.Issuance,
  });
  console.log("Invitation message:", invitationMessage)

  // HOLDER
  console.log("HOLDER");
  console.log("Processing invitation message...")
  holderAgent.vc.processMessage({
    message: invitationMessage,
  });

  holderAgent.vc.credentialArrived.on((vc) => {
    console.log("CREDENTIAL ARRIVED");
    vc
      ? holderAgent.vc.saveCredential(vc)
      : console.log("No se recibió ninguna VC");
  });

}

issueCredential();