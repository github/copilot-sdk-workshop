namespace MuseumExhibitStudio.Helpers;

public static class CuratorTerminal
{
    public static string AskLine(string question)
    {
        ArgumentNullException.ThrowIfNull(question);

        Console.Write(question);
        return Console.ReadLine()?.Trim() ?? string.Empty;
    }

    public static bool AskYesNo(string question, bool defaultYes)
    {
        ArgumentNullException.ThrowIfNull(question);

        var answer = AskLine($"{question} {(defaultYes ? "[Y/n]" : "[y/N]")}: ");

        if (string.IsNullOrWhiteSpace(answer))
        {
            return defaultYes;
        }

        if (answer.Equals("y", StringComparison.OrdinalIgnoreCase) ||
            answer.Equals("yes", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (answer.Equals("n", StringComparison.OrdinalIgnoreCase) ||
            answer.Equals("no", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return defaultYes;
    }

    public static string[] ReadFacts()
    {
        Console.WriteLine("Enter one approved fact per line. Submit a blank line when finished:");
        var facts = new List<string>();

        while (true)
        {
            var fact = AskLine(string.Empty);
            if (string.IsNullOrWhiteSpace(fact))
            {
                return facts.ToArray();
            }

            facts.Add(fact);
        }
    }

    // Lists the approved fact sets, lets the educator pick one or type their own, and returns the
    // bounded list the rest of the run uses.
    public static string[] ChooseApprovedFacts()
    {
        Console.WriteLine("Approved fact sets:");
        for (var index = 0; index < CuratorFacts.FactSets.Count; index++)
        {
            Console.WriteLine($"{index + 1}. {CuratorFacts.FactSets[index].Label}");
        }

        Console.WriteLine();

        var input = AskLine($"Choose a fact set [1-{CuratorFacts.FactSets.Count}, default 1]: ");
        var selected = int.TryParse(input, out var selection) &&
                       selection >= 1 &&
                       selection <= CuratorFacts.FactSets.Count
            ? CuratorFacts.FactSets[selection - 1]
            : CuratorFacts.FactSets[0];

        var facts = CuratorFacts.BoundFacts(selected.Facts);
        for (var index = 0; index < facts.Length; index++)
        {
            Console.WriteLine($"{index + 1}. {facts[index]}");
        }

        Console.WriteLine();

        if (!AskYesNo("Use these facts?", defaultYes: true))
        {
            facts = CuratorFacts.BoundFacts(ReadFacts());
        }

        return facts;
    }

    // The one message the entrypoint prints when a run fails.
    public static string DescribeFailure(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        return exception is TimeoutException
            ? "The curator did not respond in time. Try again."
            : $"Could not generate the exhibit: {exception.Message}";
    }

    public static void CloseTerminal()
    {
    }
}
