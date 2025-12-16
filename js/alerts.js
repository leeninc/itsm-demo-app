export const ALERT_TEMPLATES = {
  criticalVuln: {
    id: 'criticalVuln',
    category: 'Vulnerability Management',
    severity: 'CRITICAL',
    title: 'Critical Vulnerability: CVE-2024-1234 in Production',
    description: `**Vulnerability Details:**
- CVE ID: CVE-2024-1234
- Package: log4j-core
- Current Version: 2.14.0
- Fixed Version: 2.17.1
- CVSS Score: 10.0 (Critical)

**Affected Systems:**
- prod-web-server-01 (10.0.1.15)
- prod-api-server-03 (10.0.1.23)

**Remediation Steps:**
1. Upgrade log4j-core to version 2.17.1 or higher
2. Restart affected services
3. Verify patch deployment with vulnerability scan

**Detection Source:** Tenable Vulnerability Scanner
**First Detected:** 2024-12-16T10:30:00Z
**Risk:** Remote code execution, immediate action required`,
    suggestedType: 'Bug',
    suggestedPriority: 'CRITICAL',
    identifier: 'VULN-CVE-2024-1234'
  },

  complianceIssue: {
    id: 'complianceIssue',
    category: 'Compliance Violation',
    severity: 'HIGH',
    title: 'Unencrypted S3 Bucket Detected - SOC2 Violation',
    description: `**Compliance Issue:**
- Control: SOC2 CC6.7 - Encryption at Rest
- Resource: s3://prod-customer-data
- Region: us-east-1
- Account: 123456789012

**Finding:**
S3 bucket containing customer PII is not encrypted at rest, violating SOC2 requirements.

**Evidence:**
- Bucket encryption: Disabled
- Objects: 1,247 files (estimated 2.3 GB)
- Last modified: 2024-12-14

**Remediation:**
1. Enable default encryption (AES-256 or KMS)
2. Verify all objects are encrypted
3. Update bucket policy to deny unencrypted uploads

**Detection Source:** AWS Config / Wiz CSPM
**Compliance Framework:** SOC2, PCI-DSS 3.4`,
    suggestedType: 'Task',
    suggestedPriority: 'HIGH',
    identifier: 'COMP-S3-ENCRYPT-001'
  },

  securityMisconfig: {
    id: 'securityMisconfig',
    category: 'Security Misconfiguration',
    severity: 'HIGH',
    title: 'Overly Permissive Security Group - Public Database Access',
    description: `**Misconfiguration Details:**
- Resource: sg-0abc123def456789
- Type: EC2 Security Group
- Violation: Database port exposed to 0.0.0.0/0

**Risky Rules:**
- Port 5432 (PostgreSQL) open to 0.0.0.0/0
- Port 3306 (MySQL) open to 0.0.0.0/0

**Affected Resources:**
- prod-db-primary (i-0123456789abcdef0)
- prod-db-replica (i-0fedcba987654321)

**Remediation:**
1. Restrict security group to VPC CIDR only
2. Review and remove unnecessary rules
3. Implement bastion host for external access

**Detection Source:** AWS Security Hub
**CIS Benchmark:** 5.2 - Ensure no security groups allow ingress from 0.0.0.0/0 to database ports`,
    suggestedType: 'Bug',
    suggestedPriority: 'HIGH',
    identifier: 'MISCONFIG-SG-DB-001'
  },

  edrAlert: {
    id: 'edrAlert',
    category: 'EDR Alert',
    severity: 'CRITICAL',
    title: 'Suspicious Process Execution - Potential Lateral Movement',
    description: `**Alert Details:**
- Detection: Suspicious PowerShell execution
- Host: WIN-PROD-WEB-01
- User: SYSTEM
- Process: powershell.exe -encodedcommand [base64]

**Indicators:**
- Encoded command execution
- Network connection to internal host
- Credential dumping attempt detected
- Lateral movement behavior

**Timeline:**
- 2024-12-16 14:32:15 - Initial execution
- 2024-12-16 14:32:18 - LSASS memory access
- 2024-12-16 14:32:22 - Connection to 10.0.2.15:445

**Actions Taken:**
- Host isolated from network
- Process terminated
- Forensic snapshot captured

**Detection Source:** CrowdStrike Falcon EDR
**MITRE ATT&CK:** T1059.001 (PowerShell), T1003 (Credential Dumping)`,
    suggestedType: 'Bug',
    suggestedPriority: 'CRITICAL',
    identifier: 'EDR-INCIDENT-20241216-001'
  },

  codeSecurityIssue: {
    id: 'codeSecurityIssue',
    category: 'Application Security',
    severity: 'MEDIUM',
    title: 'SQL Injection Vulnerability in User API Endpoint',
    description: `**Vulnerability Details:**
- Type: SQL Injection
- Severity: MEDIUM (requires authentication)
- File: src/api/users.py
- Line: 45
- Function: get_user_by_id()

**Vulnerable Code:**
\`\`\`python
query = f"SELECT * FROM users WHERE id = {user_id}"
\`\`\`

**Exploitation:**
User input is directly interpolated into SQL query without parameterization, allowing SQL injection attacks.

**Example Exploit:**
\`\`\`
GET /api/users/1 OR 1=1--
\`\`\`

**Remediation:**
Use parameterized queries:
\`\`\`python
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
\`\`\`

**Detection Source:** Snyk Code Analysis
**CWE:** CWE-89 - SQL Injection`,
    suggestedType: 'Bug',
    suggestedPriority: 'MEDIUM',
    identifier: 'APPSEC-SQLI-001'
  }
};

export function getAllAlertTemplates() {
  return Object.values(ALERT_TEMPLATES);
}

export function getAlertById(id) {
  return ALERT_TEMPLATES[id];
}
