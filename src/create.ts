import { initializeAgents } from "./agent";

async function createDIDs() {
  console.log("Creating DIDs")
  //Se crean los agentes
  const agents = await initializeAgents();

  //Se crea un nuevo DID para el agente
  const DIDs = new Map();

  agents.map(async (agent) => {
    await agent.identity.createNewDID({
      dwnUrl: "http://ssi.gcba-extrimian.com:1337/",
    });
  });

  let didsCreated = 0;

  agents.forEach(async (agent) => {
    agent.identity.didCreated.on(async (args) => {
      if (!args) {
        console.log("Error creating DID");
        return;
      }
      console.log("DID CREATED:", args.did);
      didsCreated += 1;
      DIDs.set(agent, args.did);
    });
  });

  // Poll until all DIDs are created
  const interval = setInterval(() => {
    if (didsCreated === 3) {
      clearInterval(interval);
      console.log("All DIDs created");
      return;
    }
  }, 1000);
}

createDIDs()
  
