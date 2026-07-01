# Testing Superpowers

Superpowers is now OpenCode-focused. Plugin infrastructure tests live under `tests/opencode/`.

## OpenCode Plugin Tests

Run the default suite:

```bash
bash tests/opencode/run-tests.sh
```

The default suite checks plugin loading, bootstrap caching, and recommended agent registration without requiring a live OpenCode session.

Run integration tests when the OpenCode CLI is installed:

```bash
bash tests/opencode/run-tests.sh --integration
```

## Brainstorm Server Tests

The optional visual companion has its own Node test suite:

```bash
cd tests/brainstorm-server
npm test
```
