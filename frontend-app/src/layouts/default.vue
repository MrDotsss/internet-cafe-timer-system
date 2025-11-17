<template>
  <v-layout>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-bottom-navigation grow color="primary" active>
      <v-btn v-for="page in pages" :to="page.link">
        <v-icon>{{ page.icon }}</v-icon>
        <span>{{ page.name }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
const pages = [
  { name: "Sessions", icon: "mdi-monitor", link: "/" },
  { name: "Config", icon: "mdi-cog", link: "/config" },
];
</script>
