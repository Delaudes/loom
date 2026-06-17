# Loom — Project Context

## Stack

- Angular 21 (signals, OnPush, standalone components)
- TypeScript strict mode
- Vitest for unit tests
- Tailwind CSS 4

---

## Architecture: Hexagonal / Clean Architecture

```
Domain Models → Use Cases → View → Components
                    ↑
               Ports (interfaces)
                    ↑
            Adapters (Angular | Fake)
```

### Layers

| Layer | Files | Role |
|---|---|---|
| Domain | `*.domain.model.ts` | Pure business logic, no framework dependency |
| Use Cases | `*.use-case.ts` | Orchestration, one `execute()` method |
| View | `*.view.ts` | Bridges use cases ↔ components, holds signal state |
| View Models | `*.view.model.ts` | UI-shaped data (enums, typed state) |
| Ports | `*.port.ts` | Interfaces abstracting infrastructure |
| Adapters | `angular-*.adapter.ts` / `in-memory-*.adapter.ts` | Concrete implementations |
| Fakes | `fake-*.adapter.ts` | Test doubles for ports |
| Services | `*.service.ts` | Multi-step orchestration implementing a port (not a one-shot use case) |
| Providers | `*.provider.ts` | Angular `InjectionToken` + factory; token names in `SCREAMING_SNAKE_CASE` |

---

## Conventions

### Ports & Adapters
Every infrastructure concern has a **port** (interface `*.port.ts`) + two adapters:
- `angular-*.adapter.ts` — real Angular implementation
- `fake-*.adapter.ts` — in-memory test double

Example: `SignalPort<T>` → `AngularSignalAdapter` / `FakeSignalAdapter`

### Use Cases
- Constructor receives ports and views via injection
- Single public `execute()` method
- No Angular dependency, fully testable

### Views
- Hold state via `SignalPort<ViewModel>`
- Expose methods called by components (e.g. `update()`, `navigate()`)
- Tested in `*.view.spec.ts` with fake adapters

### Testing
- All specs live in `specs/` subfolder alongside the feature
- Fakes replace all ports — no mocking framework needed
- Specs test use cases and views, not components
- Tests follow the **Arrange → Assert initial → Act → Assert final** pattern:
  1. **Arrange** — set up all state (adapter data, expected result object with mutations)
  2. **Assert initial** — verify the state before the action
  3. **Act** — call `execute()` or the method under test
  4. **Assert final** — verify the state after the action
- The initial assert uses a fresh reference (e.g. `gameViewModelInit()`) so mutations to the expected object don't affect it; this factory helper lives **inside** the `describe` block
- **What to test in `*.view.spec.ts`**: only the methods called directly by components (e.g. `shareGame()`); methods used by use cases are covered transitively through use case tests
- **Domain model tests**: domain logic is not tested file-by-file — it is covered by use case specs that exercise it from the outside. This allows safe refactoring of internals as long as observable behaviour is preserved

### File naming
```
feature/
  core/
    feature.view.ts
    some.use-case.ts
    feature.port.ts
  models/
    feature.domain.model.ts
    feature.view.model.ts
  specs/
    feature.view.spec.ts
    some.use-case.spec.ts
    fake-feature.adapter.ts
  components/
    sub-component/
      sub-component.component.ts
      sub-component.component.html
  feature.component.ts
  feature.component.html
  feature.provider.ts
```

---

## Key Rules

- **No logic in components** — components call view methods and bind to signals only
- **Domain models are pure** — no Angular, no observables, plain TS classes
- **Ports everywhere** — never depend directly on Angular APIs inside use cases or domain
- **Fake adapters, not mocks** — tests use `Fake*` classes, never `jest.fn()` / `vi.fn()`
- **OnPush everywhere** — all components use `changeDetection: ChangeDetectionStrategy.OnPush`
