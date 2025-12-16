import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { adminApi } from '@/api/adminApi';
import { setAdminToken, setAdminEmail } from '@/utils/storage';

export const useAdminLogin = () => {
  const router = useRouter();
  const { t } = useI18n();

  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const isLoading = ref(false);

  const handleSubmit = async () => {
    errorMessage.value = '';
    isLoading.value = true;

    try {
      const response = await adminApi.login({
        email: email.value,
        password: password.value,
      });

      setAdminToken(response.access_token);
      setAdminEmail(response.email);

      router.push({ name: 'admin-dashboard' });
    } catch (error: any) {
      errorMessage.value = error?.response?.data?.message || t('auth.login.errors.failed');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    email,
    password,
    errorMessage,
    isLoading,
    handleSubmit,
  };
};
