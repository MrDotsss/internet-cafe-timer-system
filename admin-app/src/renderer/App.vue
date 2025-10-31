<template>
  <nav style="display: flex; gap: 1rem; color: #fff; padding: 1rem">
    <router-link to="/">Dashboard</router-link>
    <router-link to="/clients">Clients</router-link>
    <router-link to="/settings">Settings</router-link>
  </nav>
  <router-view />
</template>
