# 🚀 Agentic AI Testing Platform

An extensible AI-powered Software Testing Platform that transforms project documentation into autonomous testing workflows using modular AI Agents.

---

# Vision

Build a reusable platform where AI Agents collaborate to:

- Understand software projects
- Explore applications
- Generate manual test cases
- Generate automation scripts
- Execute regression testing
- Produce professional QA reports

The platform is designed to be reusable across any software project.

---

# Architecture

```text
                 PRD
                  │
                  ▼
      Project Context Agent
                  │
                  ▼
          Project Context
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
Explorer Agent         Test Design Agent
      │                       │
      ▼                       ▼
Discovery Artifacts   Manual Test Suites
      │                       │
      └───────────┬───────────┘
                  ▼
          Automation Agent
                  │
                  ▼
           Execution Agent
                  │
                  ▼
           Reporting Agent
```

---

# AI Agents

| Agent | Responsibility |
|--------|----------------|
| Project Context Agent | Build the project context from project documentation |
| Explorer Agent | Explore the application and discover UI behavior |
| Test Design Agent | Generate structured manual test cases |
| Automation Agent | Generate automation scripts |
| Execution Agent | Execute automation suites |
| Reporting Agent | Generate QA reports |

---

# Pipeline

```
PRD
↓

Project Context

↓

Exploration

↓

Test Design

↓

Automation

↓

Execution

↓

Reporting
```

---

# Project Structure

```
agentic-ai-testing-platform/

├── agents/
├── pipeline/
├── artifacts/
├── prompts/
├── docs/
├── config/
├── SESSION_HANDOFF.md
├── LESSONS_LEARNED.md
└── README.md
```

---

# Architecture Principles

- Project Context is the Single Source of Truth.
- AI Agents communicate only through artifacts.
- Each Agent has one responsibility.
- Every generated artifact becomes the input of another Agent.
- Human approval gates exist before automation.

---

# Current Status

## Completed

- Agent Framework
- Pipeline Specification
- OrangeHRM Proof of Concept
- Session Handoff
- Lessons Learned

## In Progress

- Automation Generation
- Execution Engine
- Reporting Engine

---

# Roadmap

### Phase 1

- Project Context
- Exploration
- Test Design

### Phase 2

- Automation Generation
- Test Execution

### Phase 3

- Reporting
- Azure DevOps Integration
- Multi-Agent Orchestration

---

# Technologies

- Claude Code
- Anthropic API
- Playwright MCP
- Markdown
- Git
- GitHub

---

# Goal

Build a production-ready Agentic AI Testing Platform capable of assisting QA Engineers throughout the entire software testing lifecycle.
