export const tool = {
  name: 'domotz_monitoring',
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true
  },
  description: `Manage SNMP and TCP sensors (called "Eyes" in Domotz) on devices. Use the "action" parameter to select an operation. Requires agent_id and device_id for all actions.

ACTION REFERENCE:
- list_snmp: List all SNMP sensors on a device
- create_snmp: Create an SNMP sensor (needs body with OID config)
- delete_snmp: Delete an SNMP sensor (needs sensor_id)
- snmp_history: SNMP sensor value history over time (needs sensor_id, filterable by from/to)
- snmp_trigger_functions: List available trigger functions for an SNMP sensor (needs sensor_id) — call this FIRST to get valid function_id values
- list_snmp_triggers: List triggers configured on an SNMP sensor (needs sensor_id)
- create_snmp_trigger: Create a trigger on an SNMP sensor (needs sensor_id + body with function_id and value)
- delete_snmp_trigger: Delete a trigger (needs sensor_id + trigger_id)
- create_snmp_trigger_alert: Activate alert notifications on a trigger (needs sensor_id + trigger_id + medium_name e.g. "email", "slack")
- delete_snmp_trigger_alert: Remove alert notifications from a trigger (needs sensor_id + trigger_id + medium_name)
- list_tcp: List TCP sensors on a device
- create_tcp: Create a TCP sensor (needs body with port/host config)
- delete_tcp: Delete a TCP sensor (needs service_id)

TRIGGER WORKFLOW (must follow these steps in order):
1. Call snmp_trigger_functions to get available function_ids (e.g. function_id=2 means "is greater than")
2. Call create_snmp_trigger with body containing function_id and value — VERIFY the response contains the created trigger before proceeding
3. Call create_snmp_trigger_alert with the trigger_id from step 2 to activate notifications — VERIFY the response confirms activation
If ANY step returns an error, STOP and report the error to the user. Do NOT claim success without confirming each step's response.

GOTCHAS:
- SNMP sensors and TCP sensors use different ID params: sensor_id for SNMP, service_id for TCP
- Trigger creation requires a valid function_id from snmp_trigger_functions — do not guess function_ids
- from/to on snmp_history accept ISO 8601 timestamps, default to last 7 days
- TCP sensors do NOT support triggers or alerts

EXAMPLES:
- List SNMP sensors: {"action": "list_snmp", "agent_id": 5, "device_id": 50}
- Sensor history: {"action": "snmp_history", "agent_id": 5, "device_id": 50, "sensor_id": 3}
- Get trigger functions: {"action": "snmp_trigger_functions", "agent_id": 5, "device_id": 50, "sensor_id": 3}
- Create trigger (alert when value > 90): {"action": "create_snmp_trigger", "agent_id": 5, "device_id": 50, "sensor_id": 3, "body": {"function_id": 2, "value": "90"}}
- Activate email alert on trigger: {"action": "create_snmp_trigger_alert", "agent_id": 5, "device_id": 50, "sensor_id": 3, "trigger_id": 1, "medium_name": "email"}
- List TCP sensors: {"action": "list_tcp", "agent_id": 5, "device_id": 50}`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'list_snmp', 'create_snmp', 'delete_snmp', 'snmp_history',
          'snmp_trigger_functions', 'list_snmp_triggers',
          'create_snmp_trigger', 'delete_snmp_trigger',
          'create_snmp_trigger_alert', 'delete_snmp_trigger_alert',
          'list_tcp', 'create_tcp', 'delete_tcp'
        ],
        description: 'The operation to perform'
      },
      agent_id: { type: 'integer', description: 'Agent/Collector ID' },
      device_id: { type: 'integer', description: 'Device ID' },
      sensor_id: { type: 'integer', description: 'SNMP Sensor ID' },
      service_id: { type: 'integer', description: 'TCP Service/Sensor ID' },
      trigger_id: { type: 'integer', description: 'Trigger ID' },
      medium_name: { type: 'string', description: 'Alert medium name (e.g. email, slack)' },
      from: { type: 'string', description: 'Start time for time series' },
      to: { type: 'string', description: 'End time for time series' },
      body: {
        type: 'object',
        description: 'Request body — fields depend on action. create_snmp: {oid: string (required), label?: string, unit?: string}. create_snmp_trigger: {function_id: integer (required), value: string (required)}. create_snmp_trigger_alert: no body needed (medium_name is a URL param). create_tcp: {port: integer (required), host?: string}',
        properties: {
          oid: { type: 'string', description: 'SNMP OID to monitor e.g. "1.3.6.1.2.1.1.3.0" (create_snmp)' },
          label: { type: 'string', description: 'Display label for this sensor (create_snmp)' },
          unit: { type: 'string', description: 'Unit of measurement e.g. "ms", "°C", "%" (create_snmp)' },
          function_id: { type: 'integer', description: 'Trigger function ID from snmp_trigger_functions e.g. 2 = "is greater than" (create_snmp_trigger)' },
          value: { type: 'string', description: 'Threshold value to compare against (create_snmp_trigger)' },
          port: { type: 'integer', description: 'TCP port to monitor (create_tcp)' },
          host: { type: 'string', description: 'Override host/IP address instead of device IP (create_tcp)' }
        }
      }
    },
    required: ['action']
  }
};

export const actions = {
  list_snmp:                 { method: 'GET',    url: '/agent/{agent_id}/device/{device_id}/eye/snmp' },
  create_snmp:               { method: 'POST',   url: '/agent/{agent_id}/device/{device_id}/eye/snmp',                                                                       hasBody: true },
  delete_snmp:               { method: 'DELETE', url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}' },
  snmp_history:              { method: 'GET',    url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/history',                                                    queryParams: ['from', 'to'] },
  snmp_trigger_functions:    { method: 'GET',    url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/function' },
  list_snmp_triggers:        { method: 'GET',    url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/trigger' },
  create_snmp_trigger:       { method: 'POST',   url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/trigger',                                                   hasBody: true },
  delete_snmp_trigger:       { method: 'DELETE', url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/trigger/{trigger_id}' },
  create_snmp_trigger_alert: { method: 'POST',   url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/trigger/{trigger_id}/alert/{medium_name}',                   hasBody: true },
  delete_snmp_trigger_alert: { method: 'DELETE', url: '/agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/trigger/{trigger_id}/alert/{medium_name}' },
  list_tcp:                  { method: 'GET',    url: '/agent/{agent_id}/device/{device_id}/eye/tcp' },
  create_tcp:                { method: 'POST',   url: '/agent/{agent_id}/device/{device_id}/eye/tcp',                                                                        hasBody: true },
  delete_tcp:                { method: 'DELETE', url: '/agent/{agent_id}/device/{device_id}/eye/tcp/{service_id}' },
};
