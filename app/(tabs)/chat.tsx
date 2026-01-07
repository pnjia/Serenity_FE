import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChatMessage, sendMessageToGemini } from "../../services/geminiService";

const COLORS = {
  primary: "#020bb5",
  backdrop: "#F4F7FE",
  white: "#FFFFFF",
  headline: "#1B2559",
  muted: "#A3AED0",
  userBubble: "#020bb5",
  aiBubble: "#FFFFFF",
};

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya adalah AI assistant. Ada yang bisa saya bantu?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToGemini(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Maaf, terjadi kesalahan: ${error.message}`
            : "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdownText = (text: string, isUser: boolean) => {
    // Split by lines first to handle bullets
    const lines = text.split("\n");
    const renderedLines: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      // Check if line is a bullet point
      const bulletMatch = line.match(/^(\s*)\*\s+(.+)$/);

      if (bulletMatch) {
        const [, indent, content] = bulletMatch;
        const indentLevel = indent.length / 4; // Assuming 4 spaces per indent

        renderedLines.push(
          <View
            key={`line-${lineIndex}`}
            style={[styles.bulletLine, { marginLeft: indentLevel * 16 }]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              • {renderInlineMarkdown(content, isUser)}
            </Text>
          </View>
        );
      } else if (line.trim()) {
        // Regular line with inline markdown
        renderedLines.push(
          <Text
            key={`line-${lineIndex}`}
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {renderInlineMarkdown(line, isUser)}
          </Text>
        );
      } else {
        // Empty line for spacing
        renderedLines.push(<Text key={`line-${lineIndex}`}>{"\n"}</Text>);
      }
    });

    return renderedLines;
  };

  const renderInlineMarkdown = (text: string, isUser: boolean) => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(
        <Text
          key={match.index}
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText,
            styles.boldText,
          ]}
        >
          {match[1]}
        </Text>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {renderMarkdownText(item.content, isUser)}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color={COLORS.white} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/appLogo.png")}
            style={styles.logo}
          />
          <Ionicons name="chatbubbles" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI Chat</Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>AI sedang mengetik...</Text>
          </View>
        )}

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: 70 + insets.bottom + 10 },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            placeholderTextColor={COLORS.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSendMessage}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                inputText.trim() && !isLoading ? COLORS.white : COLORS.muted
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    width: "100%",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 28,
    color: COLORS.headline,
  },
  messagesList: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
    width: "100%",
  },
  messageContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E8EEFF",
  },
  messageText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  bulletLine: {
    flexDirection: "row",
    marginVertical: 2,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.headline,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8EEFF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: "100%",
  },
  loadingText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.muted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: "#E8EEFF",
    width: "100%",
    maxWidth: "100%",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingTop: 14,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: COLORS.headline,
    maxHeight: 120,
    minHeight: 48,
    maxWidth: "100%",
    borderWidth: 2,
    borderColor: "#E8EEFF",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sendButtonDisabled: {
    backgroundColor: "#E8EEFF",
    shadowOpacity: 0,
    elevation: 0,
    borderColor: "transparent",
  },
});
