/**
 * DocLayout — reusable layout for documentation pages with left-side TOC
 */
import { useState, useEffect } from "react";

export default function DocLayout({ title, subtitle, onBack, children, toc }) {
    const [activeSection, setActiveSection] = useState(toc[0]?.id || "");

    useEffect(() => {
        const handleScroll = () => {
            for (const item of toc) {
                const element = document.getElementById(item.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        setActiveSection(item.id);
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [toc]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
        }
    };

    return (
        <div className="docs-layout-wrapper">
            {/* Left Sidebar - TOC */}
            <aside className="docs-sidebar">
                <div className="docs-toc-sticky">
                    <h4 className="docs-toc-title">Contents</h4>
                    <nav className="docs-toc">
                        {toc.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(item.id);
                                }}
                                className={`docs-toc-link ${activeSection === item.id ? "docs-toc-active" : ""}`}
                                style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="docs-page container">
                <button className="back-link" onClick={onBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </button>

                <h1 className="docs-title">{title}</h1>
                <p className="docs-subtitle">{subtitle}</p>

                {children}
            </main>
        </div>
    );
}
