# Markdown Test File

This is a test Markdown file with various code blocks to test the Markdown parsing functionality.

## DOT Code Block

```dot
digraph G {
  rankdir=LR;
  A [label="Start"];
  B [label="End"];
  A -> B;
}
```

## Mermaid Code Block

```mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
```

## Code Block without Language Specification

```
digraph G {
  rankdir=TB;
  A -> B -> C;
}
```

## Another Mermaid Code Block

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

## End of File