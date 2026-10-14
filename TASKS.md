# English Lab — Tasques pendents

Document viu per centralitzar les tasques del repositori. Quan afegim, acabem o descartem una tasca, actualitzarem aquest fitxer.

**Última actualització:** 14 d'octubre de 2026

## Pendents

### 1. Adjuntar automàticament el PDF de la rúbrica als esborranys de Gmail
- **Estat:** Pendent · Per definir la configuració
- **Prioritat:** Mitjana
- **Àmbit:** Producte final, 2n i 4t d'ESO
- **Situació actual:** El botó «Prepare email in Gmail» prepara el missatge, però el PDF s'ha de desar i adjuntar manualment.
- **Objectiu:** Generar el PDF complet de la rúbrica i crear un esborrany de Gmail amb el destinatari, l'assumpte, el missatge i el PDF ja adjunt. **No enviar cap correu automàticament**; el professor ha de revisar-lo i prémer «Envia».
- **Tasques:**
  - [ ] Decidir si es farà servir un compte Gmail personal o el compte corporatiu del centre (possibles restriccions de l'administrador).
  - [ ] Configurar un projecte Google Cloud, Gmail API i OAuth amb permisos mínims per crear esborranys.
  - [ ] Implementar una generació fiable del PDF de la rúbrica sense dependre de «Imprimeix / Desa com a PDF».
  - [ ] Crear l'esborrany amb l'arxiu PDF adjunt, sense enviament automàtic.
  - [ ] Provar el flux en 2n i 4t d'ESO, inclosos errors d'autorització i dades incompletes.
  - [ ] Revisar la privadesa de les dades dels alumnes i evitar exposar credencials o tokens al repositori.
- **Nota:** Per l'ús previst, Gmail API no acostuma a tenir cost directe; la viabilitat dependrà dels permisos OAuth i de la política del compte.

## Com mantenir aquesta llista
- **Pendent:** per fer.
- **En curs:** s'hi està treballant.
- **Bloquejada:** cal una decisió, accés o dependència.
- **Feta:** implementada i comprovada.

Quan una tasca s'acabi, moveu-la a «Completades», amb la data i, si és possible, l'enllaç al commit o PR.

## Completades

_Encara no n'hi ha cap registrada en aquest document._
