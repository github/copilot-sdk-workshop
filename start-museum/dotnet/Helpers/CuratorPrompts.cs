namespace MuseumExhibitStudio.Helpers;

// Fixed prompt text the application owns. You write the instructions that surround it.
public static class CuratorPrompts
{
    // The same structure CuratorValidation.ValidateExhibit checks after the curator answers.
    public const string ExhibitStructure = """
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

    public const string HtmlRequirements = """
        Requirements:
        - Use semantic HTML.
        - Use embedded CSS and embedded JavaScript only; no external assets or libraries.
        - Include the exhibit title, the narrative, and the three visitor questions.
        - Include a visible caveat that unsupported claims require human review.
        - Add an accessible text filter over the visitor questions that updates a visible count.
        - Treat exhibit text as data and escape text before inserting it into HTML.
        - Make keyboard focus visible.
        """;

    public static string BuildResearchPrompt(IEnumerable<string?> approvedFacts)
    {
        var facts = CuratorFacts.BoundFacts(approvedFacts);
        var factList = string.Join(Environment.NewLine, facts.Select(fact => $"- {fact}"));

        return $"""
            Research background for a museum exhibit using only the configured Wikipedia tools.

            Supplied approved facts:
            {factList}

            Search first with the scoped search tool, then read at most a few of the most relevant
            articles with readArticle. Write a short, cited factual summary that the application can
            supply to the curator through a local lookup. Associate researched claims with the
            consulted articles. Do not modify the approved facts or write exhibit copy.

            End with a ## Sources section listing each consulted article as:
            - <article title>: <canonical Wikipedia URL>
            """;
    }
}
