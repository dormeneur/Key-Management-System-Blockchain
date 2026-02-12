import React from 'react';

export default function DocumentationView() {
    return (
        <div className="docs-container animate-fade-in">
            <div className="docs-content">
                <h1 className="docs-title">Blockchain KMS Documentation</h1>
                <p className="docs-subtitle">
                    Decentralized Key Management System using Ethereum and IPFS.
                </p>

                <hr className="docs-divider" />

                <section id="overview" className="docs-section">
                    <h2>Overview</h2>
                    <p>
                        Blockchain KMS is a decentralized Key Management System built to address the single points of failure
                        in traditional server-based KMS. It uses <strong>Ethereum smart contracts</strong> for lifecycle management,
                        <strong>IPFS</strong> for encrypted storage, and <strong>browser-side AES-256-GCM encryption</strong> to ensures
                        that plaintext keys never leave the user's device.
                    </p>
                </section>

                <section id="problem-solution" className="docs-section">
                    <h2>Problem & Solution</h2>
                    <div className="docs-grid-2">
                        <div className="docs-card">
                            <h3>The Problem</h3>
                            <ul>
                                <li><strong>Single Point of Failure</strong>: Central servers going down locks out all keys.</li>
                                <li><strong>Insider Threats</strong>: Admins can potentially access plaintext keys.</li>
                                <li><strong>Opaque Logs</strong>: Audit trails on servers can be tampered with.</li>
                            </ul>
                        </div>
                        <div className="docs-card accent-card">
                            <h3>Our Solution</h3>
                            <ul>
                                <li><strong>Decentralization</strong>: No central server to hack or fail.</li>
                                <li><strong>Zero-Knowledge</strong>: Keys are encrypted client-side; network only sees blobs.</li>
                                <li><strong>Immutable Audit</strong>: Every action (Register, Rotate, Revoke) is an on-chain event.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="architecture" className="docs-section">
                    <h2>System Architecture</h2>
                    <p>The system follows a three-layer design to ensure security and scalability:</p>

                    <div className="docs-table-wrapper">
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Layer</th>
                                    <th>Responsibility</th>
                                    <th>Technology</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Encryption Layer</strong></td>
                                    <td>Generates keys & encrypts them with user password</td>
                                    <td>Web Crypto API (AES-256-GCM)</td>
                                </tr>
                                <tr>
                                    <td><strong>Storage Layer</strong></td>
                                    <td>Stores encrypted key blobs (ciphertext)</td>
                                    <td>IPFS (Pinata)</td>
                                </tr>
                                <tr>
                                    <td><strong>Lifecycle Layer</strong></td>
                                    <td>Tracks ownership, state, and audit trail</td>
                                    <td>Ethereum (Sepolia)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="security" className="docs-section">
                    <h2>Cryptography Standards</h2>
                    <p>We use industry-standard algorithms approved by NIST:</p>

                    <div className="docs-feature-list">
                        <div className="docs-feature-item">
                            <span className="feature-icon">🔒</span>
                            <div>
                                <h4>AES-256-GCM</h4>
                                <p>Authenticated Encryption. Provides both confidentiality (secrecy) and integrity (tamper-proofing). If ciphertext is modified, decryption fails.</p>
                            </div>
                        </div>
                        <div className="docs-feature-item">
                            <span className="feature-icon">🔑</span>
                            <div>
                                <h4>PBKDF2</h4>
                                <p>Derives a 256-bit AES key from your password using 100,000 iterations of SHA-256 and a random salt, protecting against brute-force attacks.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="docs-section">
                    <h2>Key Features</h2>
                    <ul className="docs-list">
                        <li><strong>Register Key</strong>: Generate -{'>'} Encrypt -{'>'} Upload to IPFS -{'>'} Record on Blockchain.</li>
                        <li><strong>Rotate Key</strong>: Re-encrypt data with new material while maintaining the same Key ID identity.</li>
                        <li><strong>Revoke Key</strong>: Permanently disable a key on-chain. This action is irreversible.</li>
                        <li><strong>Audit Trail</strong>: View a verifiable timeline of all actions on Etherscan.</li>
                    </ul>
                </section>
            </div>

            <div className="docs-sidebar">
                <h3>Contents</h3>
                <nav>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('overview').scrollIntoView({ behavior: 'smooth' }); }}>Overview</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('problem-solution').scrollIntoView({ behavior: 'smooth' }); }}>Problem & Solution</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('architecture').scrollIntoView({ behavior: 'smooth' }); }}>Architecture</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('security').scrollIntoView({ behavior: 'smooth' }); }}>Cryptography</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
                </nav>
            </div>
        </div>
    );
}
