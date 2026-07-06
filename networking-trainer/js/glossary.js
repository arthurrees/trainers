// glossary.js — shared glossary, rendered in sidebar
window.NT = window.NT || {};

NT.glossary = {
  // Foundational
  'host': { name: 'host', def: 'Any device on a network that has an IP address — your laptop, a phone, a server, a router interface.' },
  'protocol': { name: 'protocol', def: 'A set of rules two devices follow when talking to each other. HTTP, TCP, IP are protocols.' },
  'packet': { name: 'packet', def: 'A small chunk of data sent across a network, with addressing info attached so it can be routed.' },
  'header': { name: 'header', def: 'Metadata at the front of a packet — sender, receiver, length, etc. — used by intermediate devices.' },
  'payload': { name: 'payload', def: 'The actual data being delivered, after the header.' },
  'LAN': { name: 'local area network', def: 'A network confined to one location — your home, an office floor.' },
  'WAN': { name: 'wide area network', def: 'A network spanning large distances. The internet is the largest WAN.' },
  'ISP': { name: 'internet service provider', def: 'The company that connects you to the rest of the internet.' },

  // IPv4 addressing
  'IPv4': { name: 'IPv4 address', def: 'A 32-bit number identifying a host, written as four octets (e.g. 192.168.1.10).' },
  'octet': { name: 'octet', def: 'An 8-bit number, 0–255. An IPv4 address has four of them.' },
  'CIDR': { name: 'CIDR notation', def: 'IP/prefix shorthand, like 192.168.1.0/24. The number after the slash is how many leading bits are the network portion.' },
  'subnet mask': { name: 'subnet mask', def: 'A 32-bit pattern of 1-bits then 0-bits. The 1s mark the network portion of an IP, the 0s mark the host portion.' },
  'network address': { name: 'network address', def: 'The first address in a subnet — host bits all zero. Identifies the subnet itself.' },
  'broadcast address': { name: 'broadcast address', def: 'The last address in a subnet — host bits all one. A packet sent here goes to every host in the subnet.' },
  'prefix length': { name: 'prefix length', def: 'How many leading bits of an IP are the network portion. /24 means 24 network bits, 8 host bits.' },
  'private IP': { name: 'private IP range', def: 'Address blocks reserved for use inside LANs only — 10/8, 172.16/12, 192.168/16.' },
  'NAT': { name: 'network address translation', def: 'How a router lets many private IPs share one public IP — it rewrites addresses on the way out and back.' },

  // Subnetting
  'subnet': { name: 'subnet', def: 'A range of IP addresses that share the same network prefix. "Subnetting" = splitting a bigger block into smaller ones.' },
  'borrowed bits': { name: 'borrowed bits', def: 'When subnetting, the bits taken from the host portion and added to the network portion to create more (smaller) subnets.' },
  'VLSM': { name: 'variable-length subnet masking', def: 'Allowing different subnets in the same network to use different prefix lengths (rather than a fixed-size split).' },
  '/31': { name: '/31 link', def: 'A 2-address subnet used on point-to-point links. RFC 3021 lets both addresses be host IPs (no network/broadcast).' },
  '/32': { name: '/32 host', def: 'A single-host subnet. Used for loopback interfaces and "host routes".' },

  // Layers
  'OSI': { name: 'OSI model', def: 'A 7-layer reference model: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  'TCP/IP model': { name: 'TCP/IP model', def: 'The practical 4-layer model: Link, Internet (IP), Transport (TCP/UDP), Application.' },
  'L1': { name: 'Layer 1 (Physical)', def: 'Wires, radio waves, voltages — moves bits between two physically connected devices.' },
  'L2': { name: 'Layer 2 (Data Link)', def: 'Frames between hosts on the same physical network. Ethernet, Wi-Fi, MAC addresses, ARP, switches.' },
  'L3': { name: 'Layer 3 (Network)', def: 'Packets across multiple networks. IP, ICMP, routing, routers.' },
  'L4': { name: 'Layer 4 (Transport)', def: 'End-to-end conversations between applications. TCP, UDP, ports.' },
  'L7': { name: 'Layer 7 (Application)', def: 'The protocol your program speaks. HTTP, DNS, SSH, SMTP.' },
  'encapsulation': { name: 'encapsulation', def: 'Each layer wraps the layer above with its own header. Going down: Application data → TCP segment → IP packet → Ethernet frame.' },

  // Ethernet & ARP
  'MAC': { name: 'MAC address', def: '48-bit hardware address burned into a network interface, written like aa:bb:cc:11:22:33. Used inside one LAN.' },
  'frame': { name: 'frame', def: 'The Layer-2 unit. An Ethernet frame has source MAC, destination MAC, EtherType, payload, and a CRC.' },
  'ARP': { name: 'ARP', def: 'Address Resolution Protocol. "Who has IP X?" broadcast on a LAN; the host with that IP replies with its MAC.' },
  'broadcast (MAC)': { name: 'L2 broadcast', def: 'A frame sent to ff:ff:ff:ff:ff:ff goes to every host on the LAN.' },
  'EtherType': { name: 'EtherType', def: 'The field in an Ethernet frame that says what protocol is inside. 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP.' },

  // Switches & routers
  'switch': { name: 'switch', def: 'L2 device. Forwards frames within one LAN, learning a MAC table by watching source addresses.' },
  'router': { name: 'router', def: 'L3 device. Forwards packets between different networks, using a routing table.' },
  'broadcast domain': { name: 'broadcast domain', def: 'The set of hosts that will see a broadcast frame. Switches extend it; routers stop it.' },
  'collision domain': { name: 'collision domain', def: 'The set of hosts that share a transmission medium. Modern switches give each port its own collision domain.' },
  'default gateway': { name: 'default gateway', def: 'The router on your LAN that you send packets to when the destination IP is not on your subnet.' },
  'MAC table': { name: 'MAC table', def: 'A switch\'s memory: "MAC X was last seen on port P". Built by learning from source MACs in incoming frames.' },

  // Routing
  'routing table': { name: 'routing table', def: 'A list of (destination prefix → next hop) entries that a router consults for every packet.' },
  'longest-prefix match': { name: 'longest-prefix match', def: 'When several routes match a destination IP, the one with the most specific (longest) prefix wins.' },
  'default route': { name: 'default route', def: '0.0.0.0/0 — matches every IP. Used as a fallback when nothing more specific matches.' },
  'next hop': { name: 'next hop', def: 'The IP of the next router (or "directly connected") that a routing table entry points at.' },

  // TCP / UDP
  'TCP': { name: 'TCP', def: 'Transmission Control Protocol. Reliable, ordered, connection-oriented byte stream. Used for HTTP, SSH, etc.' },
  'UDP': { name: 'UDP', def: 'User Datagram Protocol. Fire-and-forget, no retransmission, no ordering. Used for DNS, voice, games.' },
  'port': { name: 'port', def: 'A 16-bit number identifying which application on a host should receive a segment. HTTP=80, HTTPS=443, DNS=53, SSH=22.' },
  'SYN': { name: 'SYN flag', def: 'TCP "synchronize" — the first packet of a connection. Carries the initial sequence number.' },
  'ACK': { name: 'ACK flag', def: 'TCP "acknowledge" — confirms receipt up to a given sequence number.' },
  'FIN': { name: 'FIN flag', def: 'TCP "finish" — politely closes one direction of the connection.' },
  'RST': { name: 'RST flag', def: 'TCP "reset" — abruptly aborts a connection. Sent on errors or unwanted traffic.' },
  'three-way handshake': { name: 'three-way handshake', def: 'TCP connection setup: client sends SYN, server replies SYN+ACK, client replies ACK. Then data flows.' },
  'sequence number': { name: 'sequence number', def: 'A 32-bit byte counter in every TCP segment. Lets the receiver reassemble bytes in order and detect gaps.' },
  'flow control': { name: 'flow control', def: 'TCP\'s receive-window mechanism — receiver tells sender "I have N bytes of buffer free."' },
  'congestion control': { name: 'congestion control', def: 'TCP\'s response to network congestion: shrink the send rate on packet loss, slowly grow it back.' },

  // DNS
  'DNS': { name: 'DNS', def: 'Domain Name System. Translates human names (example.com) into IP addresses.' },
  'A record': { name: 'A record', def: 'Maps a name to an IPv4 address.' },
  'AAAA record': { name: 'AAAA record', def: 'Maps a name to an IPv6 address.' },
  'CNAME': { name: 'CNAME record', def: 'An alias — "this name is really another name; go look that one up."' },
  'MX record': { name: 'MX record', def: 'Mail exchanger — which server handles email for this domain.' },
  'NS record': { name: 'NS record', def: 'Name server — which DNS server is authoritative for this domain.' },
  'TTL': { name: 'TTL', def: 'Time-to-live. How long a DNS answer (or an IP packet hop count) is allowed to live before being discarded.' },
  'recursive resolver': { name: 'recursive resolver', def: 'The DNS server your stub asks. It does the legwork: query root, then TLD, then authoritative.' },
  'authoritative server': { name: 'authoritative server', def: 'The DNS server that owns the records for a domain — the source of truth.' },
  'root server': { name: 'root server', def: 'The 13 DNS servers (well, 13 logical names, many physical instances) that know which TLD servers to ask.' },
  'TLD': { name: 'TLD', def: 'Top-level domain. The last label of a name: .com, .org, .uk, .io.' },

  // HTTP
  'HTTP': { name: 'HTTP', def: 'Hypertext Transfer Protocol. The Application-layer protocol of the web.' },
  'HTTPS': { name: 'HTTPS', def: 'HTTP wrapped in TLS for confidentiality + integrity. Default port 443.' },
  'method': { name: 'HTTP method', def: 'The verb of an HTTP request: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.' },
  'status code': { name: 'status code', def: 'A 3-digit number in an HTTP response. 1xx info, 2xx success, 3xx redirect, 4xx client error, 5xx server error.' },
  'URL': { name: 'URL', def: 'scheme://host[:port]/path?query#fragment — fully identifies a resource on the web.' },

  // TLS
  'TLS': { name: 'TLS', def: 'Transport Layer Security. Wraps a TCP connection with encryption + integrity + server authentication.' },
  'certificate': { name: 'certificate', def: 'A signed document binding a domain name to a public key, issued by a Certificate Authority.' },
  'CA': { name: 'Certificate Authority', def: 'A trusted issuer of certificates. Your OS/browser ships a list of root CAs it trusts.' },
  'ClientHello': { name: 'ClientHello', def: 'First TLS message: client offers its supported versions, ciphers, and (in TLS 1.3) a key share.' },
  'ServerHello': { name: 'ServerHello', def: 'Server\'s reply: chosen version, chosen cipher, its key share, and (eventually) its certificate.' },

  // NAT
  'NAT': { name: 'NAT', def: 'Network Address Translation. A router rewrites private source IPs to its single public IP on egress, and reverses the rewrite on return packets.' },
  'PAT': { name: 'PAT (NAPT)', def: 'Port Address Translation — what home routers actually do. Each connection gets a unique source port on the public side, so many private hosts can share one public IP.' },
  'port forwarding': { name: 'port forwarding', def: 'A static NAT rule: "incoming traffic on public port X goes to private host Y on port Z." Lets you host a server behind NAT.' }
};

NT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = NT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
NT.escapeHtml = escapeHtml;
