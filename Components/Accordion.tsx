import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(prev => !prev)}
        style={styles.header}
      >
        <Text style={styles.title}>
          {title} {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  content: {
    paddingLeft: 8,
  },
});

export default Accordion;
