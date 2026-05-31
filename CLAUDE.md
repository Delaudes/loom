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
| Adapters | `angular-*.ts` / `in-memory-*.ts` | Concrete implementations |
| Fakes | `fake-*.ts` | Test doubles for ports |
| Providers | `*.provider.ts` | Angular InjectionToken + factory |

---

## Conventions

### Ports & Adapters
Every infrastructure concern has a **port** (interface) + two adapters:
- `angular-*.wrapper.ts` — real Angular implementation
- `fake-*.wrapper.ts` — in-memory test double

Example: `SignalPort<T>` → `AngularSignalWrapper` / `FakeSignalWrapper`

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
