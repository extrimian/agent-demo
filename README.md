# agent-demo
Esta es la demostración de la implementación del SDK del agente SSI, usando el paquete npm @extrimian/agent

## Pasos para le replicación

1. Clonar el repositorio

2. Instalar las dependencias
    > Usar el comando `npm install` con Node.js 14

3. Crear los agentes
    > Usar el comando `npm run create` para crear los agentes

4. Emitir la credencial de prueba
    > Usar el comando `npm run issue` para emitir la credencial de prueba

5. Verificar la credencial de prueba
    > Usar el comando `npm run verify` para verificar la credencial de prueba

## Datos
Se pueden observar los datos de los agentes en la carpeta `storage` luego de ser creados, los datos del intercambio WACI en `waci-storage.json` y los datos de la credencial en `vc-storage.json` luego de emitir la credencial.

## Referencias
- [Agent SDK](https://www.npmjs.com/package/@extrimian/agent)
- [WACI reference](https://identity.foundation/waci-didcomm/)
- [Trust over IP reference](https://trustoverip.org/wp-content/toip-model/)