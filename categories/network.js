export const tool = {
  name: 'domotz_network',
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true
  },
  description: `Manage network scan policies, interfaces, routed networks, and excluded devices. Use the "action" parameter to select an operation. Requires agent_id for all actions.

ACTION REFERENCE:
- get_external_scan_policy: Get external host scan policy for a collector
- set_external_scan_policy: Set external host scan policy (needs body)
- delete_external_scan_policy: Delete external host scan policy
- get_interfaces: List network interfaces on a collector
- get_interfaces_policy: Get interfaces scanning policy
- set_interfaces_policy: Set interfaces scanning policy (needs body)
- delete_interfaces_policy: Delete interfaces scanning policy
- get_ip_scan_policy: Get IP scan policy
- set_ip_scan_policy: Set IP scan policy (needs body)
- delete_ip_scan_policy: Delete IP scan policy
- create_routed_network: Add a routed network to monitor (needs body)
- list_excluded: List devices excluded from monitoring
- add_excluded: Exclude a device from monitoring (needs device_id)
- delete_excluded: Remove a device from the exclusion list (needs device_id)

EXAMPLES:
- Show interfaces: {"action": "get_interfaces", "agent_id": 5}
- Get IP scan policy: {"action": "get_ip_scan_policy", "agent_id": 5}
- List excluded devices: {"action": "list_excluded", "agent_id": 5}`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'get_external_scan_policy', 'set_external_scan_policy', 'delete_external_scan_policy',
          'get_interfaces', 'get_interfaces_policy', 'set_interfaces_policy', 'delete_interfaces_policy',
          'get_ip_scan_policy', 'set_ip_scan_policy', 'delete_ip_scan_policy',
          'create_routed_network',
          'list_excluded', 'add_excluded', 'delete_excluded'
        ],
        description: 'The operation to perform'
      },
      agent_id: { type: 'integer', description: 'Agent/Collector ID' },
      device_id: { type: 'integer', description: 'Device ID (for excluded devices)' },
      body: {
        type: 'object',
        description: 'Request body — fields depend on action. set_external_scan_policy: {enabled: boolean (required), interval?: integer (minutes)}. set_interfaces_policy: {monitored: boolean (required)}. set_ip_scan_policy: {enabled: boolean (required), range?: string e.g. "192.168.1.0/24"}. create_routed_network: {network: string (required) e.g. "10.0.0.0/8", display_name?: string}',
        properties: {
          enabled: { type: 'boolean', description: 'Enable or disable the scan policy (set_external_scan_policy, set_ip_scan_policy)' },
          interval: { type: 'integer', description: 'Scan interval in minutes (set_external_scan_policy)' },
          monitored: { type: 'boolean', description: 'Whether to monitor this interface (set_interfaces_policy)' },
          range: { type: 'string', description: 'IP range to scan in CIDR notation e.g. "192.168.1.0/24" (set_ip_scan_policy)' },
          network: { type: 'string', description: 'Network address in CIDR notation e.g. "10.0.0.0/8" (create_routed_network)' },
          display_name: { type: 'string', description: 'Display name for the routed network (create_routed_network)' }
        },
        additionalProperties: true
      }
    },
    required: ['action']
  }
};

export const actions = {
  get_external_scan_policy:    { method: 'GET',    url: '/agent/{agent_id}/network/external-host-scan-policy' },
  set_external_scan_policy:    { method: 'PUT',    url: '/agent/{agent_id}/network/external-host-scan-policy',  hasBody: true },
  delete_external_scan_policy: { method: 'DELETE', url: '/agent/{agent_id}/network/external-host-scan-policy' },
  get_interfaces:              { method: 'GET',    url: '/agent/{agent_id}/network/interfaces' },
  get_interfaces_policy:       { method: 'GET',    url: '/agent/{agent_id}/network/interfaces-policy' },
  set_interfaces_policy:       { method: 'PUT',    url: '/agent/{agent_id}/network/interfaces-policy',          hasBody: true },
  delete_interfaces_policy:    { method: 'DELETE', url: '/agent/{agent_id}/network/interfaces-policy' },
  get_ip_scan_policy:          { method: 'GET',    url: '/agent/{agent_id}/network/ip-scan-policy' },
  set_ip_scan_policy:          { method: 'PUT',    url: '/agent/{agent_id}/network/ip-scan-policy',             hasBody: true },
  delete_ip_scan_policy:       { method: 'DELETE', url: '/agent/{agent_id}/network/ip-scan-policy' },
  create_routed_network:       { method: 'POST',   url: '/agent/{agent_id}/network/routed',                     hasBody: true },
  list_excluded:               { method: 'GET',    url: '/agent/{agent_id}/network/excluded-device' },
  add_excluded:                { method: 'POST',   url: '/agent/{agent_id}/network/excluded-device/{device_id}' },
  delete_excluded:             { method: 'DELETE', url: '/agent/{agent_id}/network/excluded-device/{device_id}' },
};
