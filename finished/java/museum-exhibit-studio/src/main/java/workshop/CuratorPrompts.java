package workshop;

import java.util.List;

public final class CuratorPrompts {
    public static final String EXHIBIT_STRUCTURE = """
            Return exactly this structure:

            # <an engaging exhibit title>
            ## Narrative
            <100-140 words, excluding the title and questions>
            ## Visitor questions
            1. <question>
            2. <question>
            3. <question>

            Write exactly three distinct visitor reflection questions. Do not add a preface,
            conclusion, software discussion, or facts the configured lookup tools did not return.
            """;

    public static final String HTML_REQUIREMENTS = """
            Requirements:
            - Use semantic HTML.
            - Use embedded CSS and embedded JavaScript only; no external assets or libraries.
            - Include the exhibit title, the narrative, and the three visitor questions.
            - Include a visible caveat that unsupported claims require human review.
            - Add an accessible text filter over the visitor questions that updates a visible count.
            - Treat exhibit text as data and escape text before inserting it into HTML.
            - Make keyboard focus visible.
            """;

    private CuratorPrompts() {
    }

    public static String buildResearchPrompt(Iterable<String> approvedFacts) {
        List<String> facts = CuratorFacts.boundFacts(approvedFacts);
        String factList = String.join(System.lineSeparator(), facts.stream().map(fact -> "- " + fact).toList());

        return """
                Research background for a museum exhibit using only the configured Wikipedia tools.

                Supplied approved facts:
                %s

                Search first with the scoped search tool, then read at most a few of the most relevant
                articles with readArticle. Write a short, cited factual summary that the application can
                supply to the curator through a local lookup. Associate researched claims with the
                consulted articles. Do not modify the approved facts or write exhibit copy.

                End with a ## Sources section listing each consulted article as:
                - <article title>: <canonical Wikipedia URL>
                """.formatted(factList);
    }
}
