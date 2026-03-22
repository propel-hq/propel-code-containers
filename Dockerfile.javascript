FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN apt-get update && apt-get install -y \
    git curl wget build-essential openssl ca-certificates \
    zsh tmux htop unzip zip jq iproute2 \
    && rm -rf /var/lib/apt/lists/*

RUN sh -c "$(curl -fsSL https://starship.rs/install.sh)" -- -y

RUN useradd -m -s /bin/bash linuxbrew \
    && echo 'linuxbrew ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
ENV HOMEBREW_NO_AUTO_UPDATE=1
RUN su - linuxbrew -c 'NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
ENV PATH="/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH"

ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install 22 \
    && nvm alias default 22 \
    && npm install -g yarn pnpm bun

ENV PATH="$NVM_DIR/versions/node/v22.0.0/bin:$PATH"

RUN . $NVM_DIR/nvm.sh \
    && npm install -g @anthropic-ai/claude-code @openai/codex

RUN mkdir -p /root/.config && echo '\
[character]\n\
success_symbol = "[❯](green)"\n\
error_symbol = "[❯](red)"\n\
\n\
[directory]\n\
truncation_length = 1\n\
truncate_to_repo = true\n\
\n\
[git_branch]\n\
format = "[$branch]($style) "\n\
\n\
[git_status]\n\
disabled = true\n\
\n\
[package]\n\
disabled = true\n\
\n\
[nodejs]\n\
disabled = true\n\
\n\
[username]\n\
disabled = true\n\
\n\
[hostname]\n\
disabled = true\n\
\n\
[cmd_duration]\n\
disabled = true\n\
' > /root/.config/starship.toml

RUN echo '\
export HISTFILE=~/.zsh_history\n\
export HISTSIZE=10000\n\
export SAVEHIST=10000\n\
setopt appendhistory\n\
setopt sharehistory\n\
setopt hist_ignore_dups\n\
setopt hist_ignore_space\n\
\n\
export NVM_DIR="/root/.nvm"\n\
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n\
\n\
export PATH="$NVM_DIR/versions/node/v22.0.0/bin:$PATH"\n\
\n\
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"\n\
\n\
eval "$(starship init zsh)"\n\
' > /root/.zshrc

RUN chsh -s /bin/zsh root || true

RUN mkdir -p /propel-code

COPY container-server/package.json /opt/propel-agent/package.json
COPY container-server/server.js /opt/propel-agent/server.js

RUN . $NVM_DIR/nvm.sh && cd /opt/propel-agent && npm install

EXPOSE 3100

WORKDIR /propel-code

CMD ["/bin/zsh", "-c", "source $NVM_DIR/nvm.sh && node /opt/propel-agent/server.js"]
