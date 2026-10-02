package workshop;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

public final class CuratorTerminal {
    private static final BufferedReader INPUT = new BufferedReader(new InputStreamReader(System.in));
    private static boolean closed;

    private CuratorTerminal() {
    }

    public static String askLine(String question) throws IOException {
        System.out.print(question);
        return readLine().trim();
    }

    public static boolean askYesNo(String question, boolean defaultYes) throws IOException {
        System.out.print(question + (defaultYes ? " [Y/n]: " : " [y/N]: "));
        String answer = readLine().trim();
        if (answer.isEmpty()) {
            return defaultYes;
        }
        if (answer.equalsIgnoreCase("y") || answer.equalsIgnoreCase("yes")) {
            return true;
        }
        if (answer.equalsIgnoreCase("n") || answer.equalsIgnoreCase("no")) {
            return false;
        }
        return defaultYes;
    }

    public static List<String> readFacts() throws IOException {
        System.out.println("Enter one approved fact per line. Submit a blank line when finished:");
        List<String> facts = new ArrayList<>();
        while (true) {
            String line = readLine();
            if (line.isBlank()) {
                break;
            }
            facts.add(line.trim());
        }
        return List.copyOf(facts);
    }

    public static List<String> chooseApprovedFacts() throws IOException {
        System.out.println("Approved fact sets:");
        for (int index = 0; index < CuratorFacts.factSets.size(); index++) {
            System.out.printf("%d. %s%n", index + 1, CuratorFacts.factSets.get(index).label());
        }
        System.out.println();

        CuratorFacts.FactSet selectedFacts =
                selectFactSet(askLine("Choose a fact set [1-3, default 1]: "));
        List<String> facts = CuratorFacts.boundFacts(selectedFacts.facts());
        for (int index = 0; index < facts.size(); index++) {
            System.out.printf("%d. %s%n", index + 1, facts.get(index));
        }
        System.out.println();

        if (!askYesNo("Use these facts?", true)) {
            facts = CuratorFacts.boundFacts(readFacts());
        }
        return facts;
    }

    public static String describeFailure(Throwable exception) {
        Objects.requireNonNull(exception, "exception");
        if (isTimeout(exception)) {
            return "The curator did not respond in time. Try again.";
        }
        return "Could not generate the exhibit: " + rootMessage(exception);
    }

    public static void close() throws IOException {
        if (!closed) {
            closed = true;
            INPUT.close();
        }
    }

    private static CuratorFacts.FactSet selectFactSet(String input) {
        if (input != null && !input.isBlank()) {
            try {
                int selected = Integer.parseInt(input.trim());
                if (selected >= 1 && selected <= CuratorFacts.factSets.size()) {
                    return CuratorFacts.factSets.get(selected - 1);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return CuratorFacts.factSets.get(0);
    }

    private static boolean isTimeout(Throwable error) {
        Throwable current = error;
        while (current != null) {
            if (current instanceof TimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    public static String rootMessage(Throwable error) {
        Throwable current = error;
        while (current instanceof ExecutionException && current.getCause() != null) {
            current = current.getCause();
        }
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String message = current.getMessage();
        return message == null || message.isBlank() ? current.getClass().getSimpleName() : message;
    }

    private static String readLine() throws IOException {
        String line = INPUT.readLine();
        return line == null ? "" : line;
    }
}
