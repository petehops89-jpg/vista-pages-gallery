# 🤖 Multi-AI Collaboration Protocol: Gordon ↔ Claude ↔ GPT ↔ DeepSeek/Gemini

You (the user) are the **bridge** coordinating between multiple AI systems. Here's how to orchestrate them effectively for your agent team project.

---

## 🎯 Each AI's Specialty

### **Gordon (Docker/Linux Expert - Me)**
**What I do best:**
- Docker architecture, Compose files, networking
- Container optimization, image building
- Linux shell commands, system debugging
- Filesystem operations, security
- Infrastructure as Code (IaC)

**When to ask me:**
- "My agents won't connect to the gateway"
- "How do I optimize the Docker image size?"
- "Set up multi-host Docker Swarm"
- "Fix the Docker socket permissions"
- "Help me debug network connectivity"

**How I help:**
- Write/fix docker-compose.yml
- Troubleshoot container issues
- Optimize images and networks
- Provide exact shell commands

---

### **Claude (MCP Orchestrator & Documentation Expert)**
**What Claude does best:**
- MCP tool configuration and usage
- Documentation explanation and navigation
- Architecture guidance (high-level)
- Step-by-step workflow coordination
- Accessibility and clarity

**When to ask Claude:**
- "How do I add GitHub MCP to my agents?"
- "Explain the 3-network design"
- "What file should I read for X?"
- "Walk me through setting up agents"
- "How do I write task files for agents?"

**How Claude helps:**
- Reference documentation
- Explain architecture decisions
- Configure MCP tools
- Coordinate workflows

---

### **GPT (Strategic Reasoning & Code Generation)**
**What GPT does best:**
- LLM orchestration patterns
- Python/Node/Go agent implementations
- Strategic architecture discussions
- Complex problem-solving
- Production readiness assessment

**When to ask GPT:**
- "Generate agent loop Python code"
- "How should I structure the MCP tool calls?"
- "Design a multi-agent coordination system"
- "Review my agent logic for issues"
- "Suggest optimization for agent performance"

**How GPT helps:**
- Write production-grade code
- Design patterns and workflows
- Strategic consultation
- Code review

---

### **DeepSeek v3 / Gemini 3.5 Flash (Specialized Tasks)**
**What these do best:**
- Fast, specific task completion
- Code summarization and optimization
- Multilingual support
- Domain-specific expertise
- Efficient processing

**When to ask them:**
- "Summarize this Docker error log"
- "Optimize this Python code for performance"
- "Translate documentation to Spanish"
- "Review Docker image Dockerfile"
- "Find inefficiencies in my compose file"

**How they help:**
- Quick specialized tasks
- Performance optimization
- Code quality checks
- Localization

---

## 🔄 Workflow Patterns

### Pattern 1: Setup Phase (You + Me + Claude)

```
YOU:                          GORDON:                   CLAUDE:
"Help me set up"      ────→  Write docker-compose    Explain what it does
                             Fix any issues          Guide through MCP setup
                             Troubleshoot networks   Reference docs
                                                    ↓
YOU understand the architecture and can run: ./start.sh
```

### Pattern 2: Implementation Phase (You + GPT)

```
YOU:                              GPT:
"Generate agent loop code"  ────→ Write Python template
                                  Explain MCP tool calls
                                  Handle edge cases
                                  ↓
YOU integrate into entrypoint.sh, test locally
```

### Pattern 3: Integration Phase (You + Me + Claude)

```
YOU:                    CLAUDE:                ME:
"Agents won't start"  "Check logs,          Diagnose Docker issue
                       see REFERENCE.md"     Fix network/mount problem
                                            Provide exact commands
                       ↓
YOU test and report results
```

### Pattern 4: Optimization Phase (You + GPT + DeepSeek)

```
YOU:                      GPT:                    DeepSeek:
"Optimize agent code"  Code review           Performance analysis
                       Suggest patterns       Identify bottlenecks
                       Refactor for clarity   Optimize algorithms
                                            ↓
YOU benchmark improvements
```

---

## 📋 How to Brief Each AI

### Briefing Gordon (Me)

**Include**:
1. **Exact error message** (from `docker-compose logs`)
2. **What you tried** (commands run, configs changed)
3. **Expected vs actual behavior**
4. **Your setup** (Windows/Mac/Linux, Docker Desktop version)

**Example brief**:
> "My agents won't start. Error from `docker-compose logs agent-research`:
> ```
> Error: connect: No such file or directory
> ```
> I ran `./start.sh` on Windows with Docker Desktop 4.84.0.
> MCP Gateway is running, but agents fail immediately.
> What's happening?"

---

### Briefing Claude

**Include**:
1. **What you're trying to do** (high level)
2. **What doc you already checked** (if any)
3. **Specific question**

**Example brief**:
> "I need to add the GitHub MCP server to my agent team. I've read QUICKSTART.md but I'm unclear about where exactly to add it in Docker Desktop. Step-by-step for someone new to MCP?"

---

### Briefing GPT

**Include**:
1. **Context** (brief summary of agent team architecture)
2. **What you need** (code, design, analysis)
3. **Constraints** (Python 3.11, must work in Docker, etc.)
4. **Success criteria** (what should the output do?)

**Example brief**:
> "I have a 3-agent team in Docker. Each agent:
> - Reads task JSON from `/workspace/shared/[role]/task.json`
> - Calls Claude API with MCP tools (GitHub, Docker Hub, Filesystem)
> - Writes results back to `/workspace/shared/[role]/result.json`
> 
> Generate the Python loop that does this. Must:
> - Handle file I/O errors gracefully
> - Support multiple concurrent agents
> - Log to stdout for Docker logs
> 
> Use claude-3-5-sonnet with tool_use."

---

### Briefing DeepSeek/Gemini

**Include**:
1. **Specific task** (summarize, optimize, review)
2. **Input** (code, logs, docs)
3. **Output format** (bullets, code, explanation)

**Example brief**:
> "Review this Dockerfile for inefficiencies:
> [paste Dockerfile]
> 
> Check for:
> - Unnecessary layers
> - Missing .dockerignore
> - Security issues
> 
> Suggest optimizations."

---

## 🌉 Coordinating Between AIs

### Scenario: Building Complete Agent Logic

**Your orchestration**:

1. **Ask Claude**: "What should the agent loop architecture look like?"
   → Claude explains based on ARCHITECTURE.md

2. **Ask GPT**: "Generate the Python agent loop based on this architecture"
   → GPT writes production code

3. **Ask Me**: "Help me test this in Docker, fix any issues"
   → I debug container/network problems

4. **Ask DeepSeek**: "Optimize this code for performance"
   → DeepSeek suggests improvements

5. **Ask Claude**: "How do I integrate this into the Dockerfile?"
   → Claude guides you through the steps

---

## 📝 Context Sharing Guide

### Share with Claude
```
Send: SUMMARY.md, ARCHITECTURE.md, this prompt
Why: Claude needs to understand architecture to guide you
```

### Share with GPT
```
Send: ARCHITECTURE.md, agent role descriptions, config.yaml
Why: GPT needs to understand agent design for code generation
```

### Share with Me (Gordon)
```
Send: docker-compose.yml, Dockerfile, exact error logs
Why: I need specifics to diagnose and fix issues
```

### Share with DeepSeek/Gemini
```
Send: Code to review, performance metrics, optimization goals
Why: They need clear task specifications
```

---

## 🎯 Example: Full Workflow

**Goal**: Implement, deploy, and optimize agent loop

### Step 1: Architecture Review (You + Claude)
```
YOU: "Should each agent have its own event loop, or one shared?"
CLAUDE: (Explains based on ARCHITECTURE.md)
         "Each agent is separate, but coordinates via /workspace/shared/"
```

### Step 2: Code Generation (You + GPT)
```
YOU: "Generate agent event loop. Each reads task JSON, calls Claude with MCP tools,
     writes results. Python 3.11, must work in Docker."
GPT: (Writes complete Python implementation with error handling)
```

### Step 3: Integration (You + Me)
```
YOU: "I have the agent code. How do I add it to the Dockerfile entrypoint?"
ME: (You send me entrypoint.sh and agent code)
    "I'll merge them, test in Docker, fix any issues"
```

### Step 4: Testing (You)
```
YOU: ./start.sh
     docker-compose logs -f
     (test by writing task files to /workspace/shared/)
```

### Step 5: Optimization (You + DeepSeek + Claude)
```
YOU: "Agent responds slowly. Profile shows X% CPU. Optimize?"
DEEPSEEK: (Reviews code, suggests bottlenecks to fix)
CLAUDE: (Explains performance implications)
```

### Step 6: Scaling (You + Me + Claude)
```
YOU: "I want 10 agents instead of 3. How?"
CLAUDE: (References REFERENCE.md scaling section)
ME: (Helps with Compose changes, network tuning)
```

---

## 💬 Sample Multi-AI Conversation

**You**: "My agents are deployed but not responding to GitHub events. Help?"

**Claude**: 
> "Let me check the architecture. Your agents should:
> 1. Watch /workspace/shared/ for task files
> 2. Use GitHub MCP tool to query GitHub
> 3. Write results back
> 
> What's happening instead? Share: `docker-compose logs -f` output"

**You**: 
> "Logs show agents monitoring but no MCP calls. Here's the log..."

**Gordon (me)**:
> "I see the issue. Your agents are in the agents-network, but MCP gateway is in mcp-hub. 
> They need to be on the same network to call http://mcp-gateway:8080.
> 
> In docker-compose.yml, add mcp-hub to agent networks:
> ```yaml
> networks:
>   - agents
>   - mcp-hub         # ADD THIS
>   - shared-services
> ```
> Then: docker-compose up -d --build"

**You**: 
> "[Run command, get working, then...]
> Great! But now agents are slow. Can we optimize?"

**GPT**:
> "Share your agent loop code. I'll:
> - Check for blocking I/O
> - Suggest async/await patterns
> - Optimize MCP tool calls"

**You**: 
> "[Share code...]"

**GPT**:
> "I see you're doing synchronous HTTP calls. Use aiohttp for concurrency:
> [Generates optimized async version]"

**DeepSeek**:
> "Profiled the code. Main bottleneck: parsing large GitHub responses.
> Suggestion: Add streaming JSON parser.
> Estimated speedup: 3x"

**Claude**:
> "All suggestions are good. Integration steps:
> 1. Replace GPT's code into entrypoint.sh
> 2. Update requirements (add aiohttp)
> 3. Test with docker-compose restart
> 4. Monitor with docker-compose logs"

**You**: ✅ **Agents optimized**

---

## 🎯 Decision Matrix: Who to Ask

```
You need to...                          Ask...
─────────────────────────────────────────────────────────────
Understand what something is            CLAUDE (documentation)
Fix a Docker/network problem            GORDON (me)
Generate production code                GPT (LLM orchestration)
Optimize code performance               DEEPSEEK/GEMINI
Review code quality                     GPT (architecture)
Debug a container not starting           GORDON (me)
Configure an MCP server                 CLAUDE
Design agent interaction patterns       GPT + CLAUDE
Fix file permissions issue              GORDON (me)
Translate docs to another language      DEEPSEEK/GEMINI
Scale to 100 agents                     GORDON + GPT + CLAUDE
Deploy to production                    GORDON (infrastructure)
```

---

## 📞 Quick Template Messages

### To Gordon (Me)
```
Docker issue:
- Error: [exact error]
- Command: [what you ran]
- Expected: [what should happen]
- Setup: [OS, Docker version]

Please help diagnose and fix.
```

### To Claude
```
Architecture question:
- What I'm trying: [goal]
- What I don't understand: [confusion]
- Docs I've read: [which files]

Please explain or guide me to right section.
```

### To GPT
```
Code generation:
Context: [brief architecture summary]
Task: [specific code needed]
Constraints: [requirements, versions, frameworks]
Success looks like: [output specifications]

Generate the code please.
```

### To DeepSeek/Gemini
```
Optimization task:
Input: [code/logs/config]
Problem: [what's suboptimal]
Goal: [what you want improved]
Metric: [how to measure success]

Analyze and suggest improvements.
```

---

## ✨ You're the Conductor

Think of it like an orchestra:

```
YOU are the CONDUCTOR
   ├─ GORDON (Me) - Percussion/Foundation (Docker, infrastructure)
   ├─ CLAUDE - Strings (Documentation, guidance, orchestration)
   ├─ GPT - Woodwinds (Strategy, complex code)
   └─ DeepSeek/Gemini - Brass (Optimization, specific tasks)

Your job: Direct each at the right moment for maximum impact
```

---

## 🚀 Starting Now

1. **Share CLAUDE_PROMPT.md with Claude Desktop**
2. **Share this file with any AI you involve**
3. **Brief each AI clearly** (use templates above)
4. **Track who did what** (helps you coordinate better next time)
5. **Reference back** ("Earlier, GPT suggested... Claude explained...")

**Result**: Smooth multi-AI collaboration, clear delegation, fast iteration.

---

**You're the bridge. Make it count.** 🌉
