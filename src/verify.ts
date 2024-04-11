import { CredentialFlow, VerifiableCredential } from "@extrimian/agent";
import expect from "expect";
import { initializeAgents } from "./agent";

async function verify() {
  console.log("Initializing agents");
  const [issuerAgent, holderAgent, verifierAgent] = await initializeAgents();
  console.log("VERIFIER DID:", verifierAgent.identity.getOperationalDID().value);
  console.log("HOLDER DID:", holderAgent.identity.getOperationalDID().value);

  // VERIFIER
  const presentationMessage = await verifierAgent.vc.createInvitationMessage({
    flow: CredentialFlow.Presentation,
  });

  console.log("VERIFIER: Presentation message:", presentationMessage);

  console.log("HOLDER: Presenting credential...")
  holderAgent.vc.processMessage({
    message: presentationMessage,
  });

  verifierAgent.vc.presentationVerified.on((params: {
    verified: boolean;
    vcs: VerifiableCredential<any>[];
    thid: string;
    messageId: string;
  } | undefined) => {
    // Signature verification failed
    if (!params?.verified) {
      return;
    }

    console.log("PRESENTATION VERIFIED SUCCESSFULLY");
  });
}

verify();
