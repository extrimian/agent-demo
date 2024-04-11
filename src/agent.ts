import {
  Agent,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  VerifiableCredential,
  WACICredentialOfferSucceded,
  WACIProtocol,
} from "@extrimian/agent";
import { FileSystemAgentSecureStorage } from "./storage/filesystem-secure-storage";
import { FileSystemStorage } from "./storage/filesystem-storage";

// export const QuarkIDEndpoint = "https://node-ssi.buenosaires.gob.ar";
export const QuarkIDEndpoint = "https://demo.extrimian.com/sidetree-proxy";

function createLocalAgent(
  waciProtocol: WACIProtocol,
  storageName: string
): Agent {
  const registry = new AgentModenaUniversalRegistry(QuarkIDEndpoint);
  registry.setDefaultDIDMethod("did:quarkid:zksync");

  const agent = new Agent({
    didDocumentRegistry: registry,
    didDocumentResolver: new AgentModenaUniversalResolver(QuarkIDEndpoint),
    vcProtocols: [waciProtocol],
    secureStorage: new FileSystemAgentSecureStorage({
      filepath: `./data/${storageName}-agent-secure-storage.json`,
    }),
    agentStorage: new FileSystemStorage({
      filepath: `./data/${storageName}-agent-storage.json`,
    }),
    vcStorage: new FileSystemStorage({
      filepath: "./data/holder-vc-storage.json",
    }),
  });

  return agent;
}

export async function initializeAgents() {
  //El agente necesita preconfigurar protocolos de intercambio de credenciales. En este instante se debe configurar también las credenciales que emitirá este agente.
  //Si el agente no va a recibir a emitir credenciales, no espera verificarlas ni recibirlas, no es necesario configurar el WACIProtocol. En ese caso se envía un objeto vacía en el constructor. Este escenario no suele ser útil, sin embargo, puede servir para probar el agente rápidamente.
  const issuerWaciProtocol = new WACIProtocol({
    issuer: {
      issueCredentials: async (waciInvitationId: string, holderDID: string) => {
        return new WACICredentialOfferSucceded({
          credentials: [
            {
              credential: {
                "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://www.w3.org/2018/credentials/examples/v1",
                  "https://w3id.org/security/bbs/v1",
                ],
                id: "http://example.edu/credentials/58473",
                type: ["VerifiableCredential", "AlumniCredential"],
                issuer: agents[0].identity.getOperationalDID().value,
                // "did:quarkid:starknet:EiCIBfgaePl4ESOOD-00GU8EAJSgwse1JDDIHYRz4aOtww",
                issuanceDate: new Date(),
                credentialSubject: {
                  id: holderDID,
                  givenName: "John",
                  familyName: "Doe",
                },
              },
              outputDescriptor: {
                id: "alumni_credential_output",
                schema: "https://schema.org/EducationalOccupationalCredential",
                display: {
                  title: {
                    path: ["$.name", "$.vc.name"],
                    fallback: "Alumni Credential",
                  },
                  subtitle: {
                    path: ["$.class", "$.vc.class"],
                    fallback: "Alumni",
                  },
                  description: {
                    text: "Credencial que permite validar que es alumno del establecimiento",
                  },
                },
                styles: {
                  background: {
                    color: "#ff0000",
                  },
                  thumbnail: {
                    uri: "https://dol.wa.com/logo.png",
                    alt: "Universidad Nacional",
                  },
                  hero: {
                    uri: "https://dol.wa.com/alumnos.png",
                    alt: "Alumnos de la universidad",
                  },
                  text: {
                    color: "#d4d400",
                  },
                },
              },
            },
          ],
          issuer: {
            name: "Universidad Nacional",
            styles: {
              thumbnail: {
                uri: "https://dol.wa.com/logo.png",
                alt: "Universidad Nacional",
              },
              hero: {
                uri: "https://dol.wa.com/alumnos.png",
                alt: "Alumnos de la universidad",
              },
              background: {
                color: "#ff0000",
              },
              text: {
                color: "#d4d400",
              },
            },
          },
          options: {
            challenge: "508adef4-b8e0-4edf-a53d-a260371c1423",
            domain: "9rf25a28rs96",
          },
        });
      },
    },
    storage: new FileSystemStorage({
      filepath: "./data/issuer-waci-storage.json",
    }),
  });

  const holderWaciProtocol = new WACIProtocol({
    holder: {
      selectVcToPresent: async (vcs: VerifiableCredential[]) => {
        return vcs;
      },
    },
    storage: new FileSystemStorage({
      filepath: "./data/holder-waci-storage.json",
    }),
  });

  const verifierWaciProtocol = new WACIProtocol({
    verifier: {
      presentationDefinition: async (invitationId: string) => {
        return {
          frame: {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://www.w3.org/2018/credentials/examples/v1",
              "https://w3id.org/security/bbs/v1",
            ],
            type: ["VerifiableCredential", "AlumniCredential"],
            credentialSubject: {
              "@explicit": true,
              type: ["AlumniCredential"],
              givenName: "John",
              familyName: "Doe",
            },
          },
          inputDescriptors: [
            {
              id: "Alumni Credential",
              name: "AlumniCredential",
              constraints: {
                fields: [
                  {
                    path: ["$.credentialSubject.givenName"],
                    filter: {
                      type: "string",
                    },
                  },
                  {
                    path: ["$.credentialSubject.familyName"],
                    filter: {
                      type: "string",
                    },
                  },
                ],
              },
            },
          ],
        };
      },
    },
    storage: new FileSystemStorage({
      filepath: "./data/verifier-waci-storage.json",
    }),
  });

  //Crear una nueva instancia del agente, se deben pasar los protocolos a usar para la generación de VC (por ejemplo el WACIProtocol que definimos anteriormente)
  const issuerAgent = createLocalAgent(issuerWaciProtocol, "issuer");
  const holderAgent = createLocalAgent(holderWaciProtocol, "holder");
  const verifierAgent = createLocalAgent(verifierWaciProtocol, "verifier");
  const agents = [issuerAgent, holderAgent, verifierAgent];

  //Siempre, en primer lugar, se debe inicializar el agente para comenzar a operar. Esto configura clases internas que son requeridas para funcionar.
  // await Promise.all(agents.map(async (agent) => agent.initialize()));

  // console.log("Waiting for agents to be ready");
  // const wait = async () => new Promise<void>((resolve, reject) => {
  //   setTimeout(() => {
  //       resolve();
  //   }, 10000);
  // });
  // await wait();

  // return agents;

  // Wait for each agent to finalize agent.initialize() async method
  for (const agent of agents) {
    await agent.initialize();
  }

  return agents;
}
