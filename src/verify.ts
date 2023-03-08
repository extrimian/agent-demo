import { CredentialFlow } from "@extrimian/agent";
import expect from "expect";
import { initializeAgents } from "./agent";

async function verify() {
  console.log("Initializing agents");
  const [issuerAgent, holderAgent, verifierAgent] = await initializeAgents();

  // VERIFIER
  console.log("VERIFIER");
  const presentationMessage = await verifierAgent.vc.createInvitationMessage({
    flow: CredentialFlow.Presentation,
  });

  console.log("Presentation message:", presentationMessage);

  console.log("Presenting credential...") 
  holderAgent.vc.processMessage({
    message: presentationMessage,
  });

  verifierAgent.vc.credentialPresented.on((args) => {
    console.log("CREDENTIAL PRESENTED");
    expect(args).not.toBe(undefined);
    if (args) {
      expect(args.vcVerified).toBe(true);
      expect(args.presentationVerified).toBe(true);
      console.log("CREDENTIAL PRESENTATION APPROVED")
    }
  });
  
}

verify();
