#!/usr/bin/env bash
set -euo pipefail

cli_dir=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
venv="$cli_dir/.venv"
python="$venv/bin/python"
installed="$venv/.bday-pyproject.toml"

if [[ ! -x "$python" || ! -x "$venv/bin/pip" ]]; then
    if ! python3 -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
        printf '%s\n' 'Birthday Studio needs Python 3.10 or newer. Install python3 and run this launcher again.' >&2
        exit 1
    fi
    python3 -m venv "$venv" >&2
fi

# Refresh the editable install when the project's packaging metadata changes.
if [[ ! -x "$venv/bin/bday" ]] || ! cmp -s "$cli_dir/pyproject.toml" "$installed"; then
    "$python" -m pip install --editable "$cli_dir" >&2
    cp "$cli_dir/pyproject.toml" "$installed"
fi

exec "$venv/bin/bday" "$@"
